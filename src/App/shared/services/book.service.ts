import { inject as tsInject, injectable } from "tsyringe";
import { RxAxios } from "../modules/rxjs-axios";
import { TOKENS } from "../modules/di/tokens";
import { catchError, map, Observable, of, throwError } from "rxjs";

export interface BookLike {
  id: string;
  title: string;
  coverUrl?: string | null;
  author?: string | null;
}

export interface ReadingGoalBookLike {
  id: string;
  goalBookId?: string | null;
  isRead: boolean;
  completedAt?: string | null;
  book: BookLike;
}

export interface ReadingGoalLike {
  id?: string | null;
  year: number;
  targetCount: number | null;
  totalBooks: number;
  achievedBooks: number;
  progress: number;
  books: ReadingGoalBookLike[];
}

@injectable()
export class bookService {
  constructor(@tsInject(TOKENS.Http) private http: RxAxios) {}

  private getAuthToken(): string | null {
    return localStorage.getItem("authToken");
  }

  private addAuthHeaders() {
    const token = this.getAuthToken();

    if (token) {
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }

    return {};
  }

  private isNotFoundError(error: unknown): boolean {
    return (
      RxAxios.isAxiosError(error) &&
      (error.response?.status === 404 || error.response?.status === 204)
    );
  }

  private unwrapPayload(input: any): any {
    if (input?.data?.data !== undefined) {
      return input.data.data;
    }

    if (input?.data !== undefined) {
      return input.data;
    }

    return input;
  }

  private normalizeGoalResponse(
    input: any,
    year: number,
  ): ReadingGoalLike | null {
    const payload = this.unwrapPayload(input);

    if (!payload) {
      return null;
    }

    let goal = payload;

    if (Array.isArray(goal)) {
      goal =
        goal.find((item) => Number(item?.year) === year) ?? goal[0] ?? null;
    }

    if (!goal) {
      return null;
    }

    const items = Array.isArray(goal?.items)
      ? goal.items
      : Array.isArray(goal?.books)
        ? goal.books
        : [];

    const hasCreatedGoal =
      Boolean(goal?.goalId ?? goal?.id) ||
      goal?.targetCount !== null ||
      items.length > 0;

    if (!hasCreatedGoal) {
      return null;
    }

    const books = items
      .map((item: any, index: number): ReadingGoalBookLike | null => {
        const rawBook = item?.book;

        if (!rawBook?.id && !rawBook?.title) {
          return null;
        }

        const isRead =
          item?.isRead === true ||
          item?.shelfItem?.status === "READ" ||
          Boolean(item?.completedAt);

        return {
          id: String(item?.goalBookId ?? item?.id ?? rawBook?.id ?? `${index}`),
          goalBookId: item?.goalBookId ?? item?.id ?? null,
          isRead,
          completedAt: item?.completedAt ?? null,
          book: {
            id: String(rawBook?.id ?? `${index}`),
            title: String(rawBook?.title ?? "Untitled"),
            coverUrl: rawBook?.coverUrl ?? null,
            author: rawBook?.author ?? null,
          },
        };
      })
      .filter((item: ReadingGoalBookLike | null): item is ReadingGoalBookLike =>
        Boolean(item),
      );

    const achievedBooks =
      goal?.achievedBooks !== undefined && goal?.achievedBooks !== null
        ? Number(goal.achievedBooks)
        : books.filter((item) => item.isRead).length;

    const targetCount =
      goal?.targetCount !== undefined && goal?.targetCount !== null
        ? Number(goal.targetCount)
        : null;

    const totalBooks =
      goal?.totalBooks !== undefined && goal?.totalBooks !== null
        ? Number(goal.totalBooks)
        : books.length;

    const denominator =
      targetCount && targetCount > 0 ? targetCount : totalBooks || 1;
    const fallbackProgress = Number(
      ((achievedBooks / denominator) * 100).toFixed(2),
    );

    const progress =
      goal?.progress !== undefined && goal?.progress !== null
        ? Number(goal.progress)
        : fallbackProgress;

    return {
      id: goal?.goalId ?? goal?.id ?? null,
      year: Number(goal?.year ?? year),
      targetCount,
      totalBooks,
      achievedBooks,
      progress,
      books,
    };
  }

  private getGoalByEndpoint(
    endpoint: string,
    year: number,
  ): Observable<ReadingGoalLike | null> {
    return this.http
      .get<any>(endpoint, this.addAuthHeaders())
      .pipe(map((response) => this.normalizeGoalResponse(response, year)));
  }

  getReadingGoalByYear(year: number): Observable<ReadingGoalLike | null> {
    const endpoints = [`goals?year=${year}`, `reading-goals?year=${year}`];

    return this.getGoalByEndpoint(endpoints[0], year).pipe(
      catchError((firstError) => {
        if (!this.isNotFoundError(firstError)) {
          return throwError(() => firstError);
        }

        return this.getGoalByEndpoint(endpoints[1], year).pipe(
          catchError((secondError) => {
            if (this.isNotFoundError(secondError)) {
              return of(null);
            }

            return throwError(() => secondError);
          }),
        );
      }),
    );
  }
}
