import "reflect-metadata";
import { RxEventBus } from "@rxjs-toolkit/eventbus";

import { map, Observable } from "rxjs";
import { inject as tsInject, injectable } from "tsyringe";

import { CreateUserModelLike, UserModelLike } from "../models/user.model";
import { RxAxios } from "../modules/rxjs-axios";
import { LoginDtoModelLike } from "../models/dto/users.model";
import { TOKENS } from "../modules/di/tokens";

const defaultDelay = 1000;

@injectable()
export class authService {
  constructor(
    @tsInject(TOKENS.Http) private http: RxAxios,
    @tsInject(TOKENS.EventBus) private eventBus: RxEventBus,
  ) {}

  private getAuthToken(): string | null {
    return localStorage.getItem("authToken");
  }

  private addHeaders() {
    const token = this.getAuthToken();
    if (token) {
      return {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
    }
    return {};
  }

  login(dto: LoginDtoModelLike): Observable<string> {
    return this.http.post<any>(`auth/login`, dto).pipe(
      map((response) => {
        const token = response.data?.data?.token || response.data?.token;

        return token;
      }),
    );
  }

  create(dto: CreateUserModelLike): Observable<CreateUserModelLike> {
    return this.http
      .post<CreateUserModelLike>(`auth/register`, dto)
      .pipe(map((x) => x.data));
  }

  logout(): Observable<string> {
    return this.http
      .post<{ token: string }>(`auth/logout`, null, this.addHeaders())
      .pipe(map((response) => response.data.token));
  }
}
