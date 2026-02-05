import { Observable, from, of } from "rxjs";
import { PageResults } from "./classes";

export function pageToPageIndex(page: number, pageSize: number) {
  return Math.floor(Math.max(0, page - 1) * pageSize);
}

export function pageIndexToPage(pageIndex: number, pageSize: number) {
  return Math.floor(pageIndex / pageSize + 1);
}

export function resolveObservable<T>(
  observable:
    | Observable<T[] | PageResults<T>>
    | Promise<T[] | PageResults<T>>
    | T[]
    | PageResults<T>,
) {
  if (observable instanceof Promise) {
    observable = from(observable);
  }

  if (!(observable instanceof Observable)) {
    observable = of(observable);
  }

  return observable;
}
