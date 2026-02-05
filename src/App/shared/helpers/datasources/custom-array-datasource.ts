import { asapScheduler, filter, map, observeOn, Subject } from "rxjs";
import {
  ArrayUtils,
  EditsOperationsLike,
  EditsResultLike,
} from "../../utils/array.utils";
import {
  ExtractExpr,
  ExtractExprFn,
  ItemExprUtils,
} from "../../utils/item-expr.utils";
import {
  CustomRawDataSource,
  IRawDataSourceOptions,
} from "./custom-raw-datasource";
import { DataSourceValueLike } from "./types";

export interface IArrayDataSourceOptions<
  T,
  K = any,
  D extends ArrayDataSource<T, K, any> = ArrayDataSource<T, K, any>,
> extends Omit<IRawDataSourceOptions<T, D>, "load"> {
  data: T[];
  keyExpr?: ExtractExpr<T, K>;
  updater?: (newItem: T, oldItem: T) => T;
  canUpdateFn?: (newItem: T, oldItem: T) => boolean;
}

export class ArrayDataSource<
  T,
  K = any,
  D extends ArrayDataSource<T, K, any> = ArrayDataSource<T, K, any>,
> extends CustomRawDataSource<T, D> {
  private _items: T[];

  private _updater?: (newItem: T, oldItem: T) => T;
  private _canUpdateFn?: (newItem: T, oldItem: T) => boolean;
  private _keyGetter?: ExtractExprFn<T, K>;

  private _changesSubject = new Subject<EditsResultLike<T>>();

  readonly changes = this._changesSubject
    .asObservable()
    .pipe(observeOn(asapScheduler));

  readonly adds = this.changes.pipe(
    map((e) => e?.adds),
    filter((list) => !!list?.length),
  );

  readonly updates = this.changes.pipe(
    map((e) => e?.updates),
    filter((list) => !!list?.length),
  );

  readonly deletes = this.changes.pipe(
    map((e) => e?.deletes),
    filter((list) => !!list?.length),
  );

  constructor(options: IArrayDataSourceOptions<T, K, D>) {
    super({
      ...options,
      load: function () {
        return this._items;
      },
    });

    this._items = options?.data?.slice() ?? [];

    this._updater = options?.updater;
    this._canUpdateFn = options?.canUpdateFn;
    this._keyGetter = ItemExprUtils.buildGetter(options?.keyExpr);
  }

  override reload(): void {
    this.clearRawData();
    super.reload();
  }

  override dispose(): void {
    if (this.disposed) {
      return;
    }

    super.dispose();
    this._items = null;
    this._updater = null;
    this._canUpdateFn = null;
    this._keyGetter = null;
  }

  data(): ReadonlyArray<T> {
    return this._items;
  }

  add(item: T) {
    return this.addRange([item]);
  }

  addRange(items: T[]) {
    return this.applyEdits({
      adds: items,
    });
  }

  update(item: T) {
    return this.updateRange([item]);
  }

  updateRange(items: T[]) {
    return this.applyEdits({
      updates: items,
    });
  }

  addOrUpdate(item: T) {
    return this.addOrUpdateRange([item]);
  }

  addOrUpdateRange(items: T[]) {
    return this.applyEdits({
      adds: items,
      updates: items,
    });
  }

  remove(key: K) {
    return this.removeRange([key]);
  }

  removeRange(keys: K[]) {
    return this.applyEdits({
      deletes: keys,
    });
  }

  removeItem(item: T) {
    return this.removeItemsRange([item]);
  }

  removeItemsRange(items: T[]) {
    const keys = ArrayUtils.keys(items, this._keyGetter);
    return this.applyEdits({
      deletes: keys,
    });
  }

  applyEdits(edits: EditsOperationsLike<T, K>) {
    const changes = ArrayUtils.applyEdits(
      this._items,
      edits,
      this._keyGetter,
      this._updater,
      this._canUpdateFn,
    );
    if (changes?.hasChanges) {
      this._changesSubject.next(changes);

      this.reload();

      return true;
    }

    return false;
  }
}
