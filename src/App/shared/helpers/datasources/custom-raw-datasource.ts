import {
  Observable,
  asapScheduler,
  from,
  of,
  map,
  observeOn,
  shareReplay,
  switchMap,
} from "rxjs";
import orderBy from "lodash/orderBy";
import {
  CustomDataSource,
  IDataLoadOptions,
  IDataSourceOptions,
} from "./custom-datasource";

import { ExtractExpr, ItemExprUtils } from "App/shared/utils/item-expr.utils";
import { PageResults } from "./classes";
import { DataSourceValueLike } from "./types";

const defaultScheduler = asapScheduler;

export interface IRawDataSourceOptions<
  T,
  D extends CustomRawDataSource<T, any> = CustomRawDataSource<T, any>,
> extends Omit<IDataSourceOptions<T>, "load"> {
  load: (this: D) => DataSourceValueLike<T>;
  filterFn?: (this: D, list: T[]) => DataSourceValueLike<T>;
  searchExpr?: ExtractExpr<T>;
}

export class CustomRawDataSource<
  T,
  D extends CustomRawDataSource<T, any> = CustomRawDataSource<T, any>,
> extends CustomDataSource<T, D> {
  private _rawDataObservable: Observable<T[]>;
  private _rawData: T[];

  searchExpr: ExtractExpr<T>;
  filterFn?: (this: D, list: T[]) => DataSourceValueLike<T>;

  constructor(options: IRawDataSourceOptions<T, D>) {
    super({
      ...options,
      load: (() => {
        const { load } = options;

        return function (this: D, o) {
          let observable: Observable<T[]> = this._rawDataObservable;
          if (!observable) {
            const ref = new WeakRef<D>(this as any);
            observable = resolveObservable(load.call(this)).pipe(
              map((list) => {
                list = list?.slice();

                ref.deref()._rawData = list as any;

                return list;
              }),
              shareReplay<any>({
                bufferSize: 1,
                refCount: true,
              }),
            );
            this._rawDataObservable = observable;
          }

          return this._handleRawDataOp(observable, o) as any;
        };
      })(),
    });

    this.filterFn = options?.filterFn;
    this.searchExpr = options?.searchExpr;
  }

  override dispose(): void {
    if (this.disposed) {
      return;
    }

    super.dispose();
    this.clearRawData();

    this.filterFn = null;
    this.searchExpr = null;
  }

  rawData(): ReadonlyArray<T> {
    return this._rawData;
  }

  clearRawData() {
    this._rawDataObservable = null;
    this._rawData = null;
    this.clearCache();
  }

  private _handleRawDataOp(
    observable: Observable<T[]>,
    options: IDataLoadOptions,
  ) {
    const ref = new WeakRef<D>(this as any);
    const { filterFn, searchExpr } = this;

    if (filterFn) {
      observable = observable.pipe(
        observeOn(defaultScheduler),
        switchMap((list) => {
          return resolveObservable(filterFn.call(ref.deref(), list.slice()));
        }),
      ) as any;
    }

    if (options.searchText && searchExpr) {
      const extractor = ItemExprUtils.buildGetter(searchExpr);

      observable = observable.pipe(
        observeOn(defaultScheduler),
        map((list) => {
          const text = options.searchText.toUpperCase();

          list = list.filter((x, i) => {
            const aux: string = extractor.call(ref.deref(), x, i);
            return !!aux?.toUpperCase?.()?.includes?.(text);
          });
          return list;
        }),
      );
    }

    if (options.sort?.length) {
      observable = observable.pipe(
        observeOn(defaultScheduler),
        map((list) => {
          list = orderBy(
            list,
            options.sort.map((x) => x.selector),
            options.sort.map((x) => x.direction || "asc"),
          );

          return list;
        }),
      );
    }

    const skip = options.skip;
    const take = options.take >= Number.MAX_SAFE_INTEGER ? null : options.take;
    if (skip || take) {
      return observable.pipe(
        observeOn(defaultScheduler),
        map((list) => {
          const res: PageResults<any> = {
            totalCount: list.length,
          };

          if (skip && take) {
            list = list.slice(skip, skip + take);
          } else if (skip) {
            list = list.slice(skip);
          } else if (take) {
            list = list.slice(0, take);
          }

          res.results = list;

          return res;
        }),
      );
    }

    return observable;
  }
}

function resolveObservable<T>(source: DataSourceValueLike<T>): Observable<T[]> {
  let observable: Observable<T[] | PageResults<T>>;

  if (source instanceof Promise) {
    observable = from(source);
  } else if (!(source instanceof Observable)) {
    observable = of(source);
  } else {
    observable = source;
  }

  return observable.pipe(
    map((res) => {
      if (!Array.isArray(res)) {
        return res?.results ?? [];
      }

      return res;
    }),
  );
}
