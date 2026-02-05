import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subject,
  Subscription,
  asapScheduler,
  defer,
  from,
  of,
  zip,
} from "rxjs";
import { IDataSource } from "./datasource";
import {
  pageIndexToPage,
  pageToPageIndex,
  resolveObservable,
} from "./functions";
import {
  catchError,
  finalize,
  first,
  observeOn,
  subscribeOn,
  take,
  takeUntil,
  tap,
} from "rxjs/operators";
import { PageResults } from "./classes";
import { LoadingController } from "../loading.controller";

export type SortDirection = "asc" | "desc" | "";

export interface Sort {
  selector: string;
  direction: SortDirection;
}

export interface IDataLoadOptions {
  skip: number;
  take: number;
  sort?: Sort[];
  searchText?: string;
}

export interface IDataSourceOptions<
  T,
  D extends CustomDataSource<T, any> = CustomDataSource<T, any>,
> {
  pageIndex?: number;
  pageSize?: number;
  load: (
    this: D,
    options: IDataLoadOptions,
  ) =>
    | Observable<PageResults<T> | T[]>
    | Promise<PageResults<T> | T[]>
    | PageResults<T>
    | T[];
  loadingController?: LoadingController;
  initialLoad?: boolean;
  infinityMode?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onDisposed?: () => void;
}

export class CustomDataSource<
  T,
  D extends CustomDataSource<T, any> = CustomDataSource<T, any>,
> implements IDataSource
{
  private _fetchedPages = new Set<number>();
  private _cachedData: T[] = [];
  private _itemsSubject = new BehaviorSubject<T[]>([]);

  infinityMode: boolean;
  pageIndex: number;
  pageSize: number;
  searchText: string;
  sort: Sort;

  private _isFirstLoadSubject = new BehaviorSubject<boolean>(false);
  get isFirstLoaded() {
    return this._isFirstLoadSubject.getValue();
  }

  get onFirstLoaded() {
    return this._isFirstLoadSubject.asObservable().pipe(first((x) => x));
  }

  private _totalCount = -1;
  get totalCount() {
    return this._totalCount;
  }

  get page() {
    return pageIndexToPage(this.pageIndex, this.pageSize);
  }

  set page(value) {
    this.pageIndex = pageToPageIndex(value, this.pageSize);
  }

  get hasPreviousPage() {
    return this.page > 1;
  }

  get hasNextPage() {
    return this.totalCount > 0 && this.page * this.pageSize < this.totalCount;
  }

  private _disposed = false;
  get disposed() {
    return this._disposed;
  }

  private _loadingController: LoadingController;
  public get loadingController() {
    if (!this._loadingController) {
      this._loadingController = new LoadingController();
    }

    return this._loadingController;
  }

  public set loadingController(value) {
    this._loadingController = value;
  }

  get loadingChanges() {
    return this.loadingController.changes;
  }

  private _cancelRenderPageListSubject = new Subject<void>();
  private _loadRequestSubject = new Subject<void>();
  private _reloadRequestSubject = new Subject<void>();

  private _pageLoadedRequestSubject = new Subject<{
    page: number;
    items: T[];
  }>();

  private _pageLoadRequestErrorSubject = new Subject<{
    page: number;
    error: any;
  }>();

  private _disposeSubject = new Subject<void>();

  get onPageLoaded() {
    return this._pageLoadedRequestSubject.asObservable();
  }

  get onPageLoadError() {
    return this._pageLoadRequestErrorSubject.asObservable();
  }

  get onLoad() {
    return this._loadRequestSubject.asObservable();
  }

  get onLoadCanceled() {
    return this._cancelRenderPageListSubject.asObservable();
  }

  get onReload() {
    return this._reloadRequestSubject.asObservable();
  }

  get onDispose() {
    return this._disposeSubject.asObservable();
  }

  private _connectionsCount = 0;
  private readonly _subscription = new Subscription();

  constructor(private options: IDataSourceOptions<T, D>) {
    this.infinityMode = !!options.infinityMode;
    this.pageIndex = options.pageIndex ?? 0;
    this.pageSize = options.pageSize ?? Number.MAX_SAFE_INTEGER;
    this.loadingController = options.loadingController;
  }

  dispose() {
    if (!this.disposed) {
      this._disposed = true;
      this._itemsSubject.complete();
      this._itemsSubject = null;

      this._cancelRenderPageListSubject.next();
      this._cancelRenderPageListSubject.complete();
      this._cancelRenderPageListSubject = null;

      this._isFirstLoadSubject.complete();
      this._isFirstLoadSubject = null;

      this._subscription?.unsubscribe();

      this.clearCache();
      this.options.onDisposed?.();
      this.options = null;

      this._disposeSubject.next();
      this._disposeSubject.complete();
      this._disposeSubject = null;
    }
  }

  toObservable() {
    if (this.disposed) {
      throw new Error("DataSource has disposed");
    }

    return new Observable<T[]>((subscriber) => {
      if (this.disposed) {
        throw new Error("DataSource has disposed");
      }

      this._setupConnection();

      subscriber.add(
        this._itemsSubject.subscribe({
          next: (list) => {
            subscriber.next(list as any);
          },
          complete: () => {
            subscriber.complete();
          },
        }),
      );

      subscriber.add(() => {
        if (this._connectionsCount > 0) {
          --this._connectionsCount;

          if (this._connectionsCount === 0) {
            this.cancel();
          }
        }
      });
    });
  }

  isLoading() {
    return this.loadingController.isShown();
  }

  cancel() {
    if (this.disposed) {
      return;
    }

    this._cancelRenderPageListSubject.next();
  }

  load() {
    if (this.disposed) {
      return;
    }

    this.cancel();
    this._loadRequestSubject.next();
    this._fetchPages([this.page]);
  }

  reload() {
    this.clearCache();
    this._reloadRequestSubject.next();
    this.load();
  }

  clearCache() {
    this._cachedData.length = 0;
    this._fetchedPages.clear();
  }

  items(): ReadonlyArray<T> {
    return this._cachedData;
  }

  pageItems(): ReadonlyArray<T> {
    let start: number;
    let end: number;
    if (!this.infinityMode) {
      start = this.pageIndex;
      end = Math.min(this._cachedData.length, start + this.pageSize);
    } else {
      start = 0;
      end = this._cachedData.length;
    }

    return this._cachedData.slice(start, end);
  }

  private _setupConnection() {
    this.options.onConnect?.();

    if (this._connectionsCount++ === 0) {
      if ((this.options.initialLoad ?? true) && !this.isLoading()) {
        this._subscription.add(
          of(null)
            .pipe(observeOn(asapScheduler))
            .subscribe(() => {
              this.reload();
            }),
        );
      }
    }
  }

  private _fetchPages(pages: number[], ignorePagesLoaded = false) {
    const { pageSize } = this;

    pages = pages.filter((x) => !!x);

    const observables = pages
      .map((page) => {
        const pageIndex = pageToPageIndex(page, pageSize);

        let observable: Observable<any>;
        if (this._fetchedPages.has(page)) {
          if (ignorePagesLoaded) {
            return null;
          }

          observable = of(null);
        } else {
          this._fetchedPages.add(page);

          let sort: Sort[];
          if (this.sort?.selector && this.sort.direction) {
            sort = [
              {
                selector: this.sort.selector,
                direction: this.sort.direction,
              },
            ];
          }

          observable = defer(() => {
            return resolveObservable<T>(
              this.options.load.call(this as any, {
                skip: pageIndex,
                take: pageSize >= Number.MAX_SAFE_INTEGER ? null : pageSize,
                sort,
                searchText: this.searchText,
              }),
            );
          }).pipe(
            subscribeOn(asapScheduler),
            observeOn(asapScheduler),
            take(1),
            tap((res) => {
              let results: T[];
              if (Array.isArray(res)) {
                results = res;
                this._totalCount = res.length;
              } else {
                if (res.totalCount > -1) {
                  this._totalCount = res.totalCount;
                }

                results = res.results ?? [];
              }

              this._cachedData.length = this._totalCount;
              this._cachedData.splice(pageIndex, pageSize, ...results);
            }),
          );
        }

        return observable.pipe(
          observeOn(asapScheduler),
          tap({
            next: () => {
              const index = pages.indexOf(page);
              if (index > -1) {
                pages.splice(index, 1);
              }

              let list: T[];
              let start: number;
              let end: number;
              if (!this.infinityMode) {
                start = pageIndex;
                end = Math.min(this._cachedData.length, pageIndex + pageSize);
              } else {
                start = 0;
                end = this._cachedData.length;
              }

              list = this._cachedData.slice(start, end);

              this._itemsSubject.next(list);

              this._pageLoadedRequestSubject.next({ page, items: list });

              if (!this.isFirstLoaded) {
                this._isFirstLoadSubject.next(true);
              }
            },
          }),
          catchError((error) => {
            this._pageLoadRequestErrorSubject.next({
              page,
              error,
            });

            return of(null);
          }),
        );
      })
      .filter((x) => !!x);

    if (!observables.length) {
      return;
    }

    this.loadingController?.show();
    zip(...observables)
      .pipe(
        finalize(() => {
          this.loadingController?.hide();
        }),
        takeUntil(
          this._cancelRenderPageListSubject.pipe(
            tap(() => {
              for (let page of pages) {
                if (typeof page === "number") {
                  this._fetchedPages.delete(page);
                }
              }
            }),
          ),
        ),
      )
      .subscribe();
  }
}
