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

export interface CurrentReadingItemLike {
  id: string;
  pagesRead: number;
  status?: string | null;
  updatedAt?: string | null;
  book: {
    id: string;
    title: string;
    author?: string | null;
    coverUrl?: string | null;
    pages?: number | null;
  };
}
