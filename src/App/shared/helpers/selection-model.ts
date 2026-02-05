import { filter, map, Subject } from "rxjs";
import {
  ArrayUtils,
  EditsOperationsLike,
  EditsResultLike,
} from "../utils/array.utils";
import {
  ExtractExpr,
  ExtractExprFn,
  ItemExprUtils,
} from "../utils/item-expr.utils";

export class SelectionModel<T = any, K = T> {
  private _items: T[];
  private _keysSet: Set<K>;

  private _updater?: (newItem: T, oldItem: T) => T;
  private _canUpdateFn?: (newItem: T, oldItem: T) => boolean;
  private _keyGetter?: ExtractExprFn<T, K>;

  private _changesSubject = new Subject<EditsResultLike<T>>();

  readonly changes = this._changesSubject.asObservable();

  readonly adds = this.changes.pipe(
    map((e) => e?.adds),
    filter((list) => !!list?.length)
  );

  readonly updates = this.changes.pipe(
    map((e) => e?.updates),
    filter((list) => !!list?.length)
  );

  readonly deletes = this.changes.pipe(
    map((e) => e?.deletes),
    filter((list) => !!list?.length)
  );

  readonly itemsChanged = (() => {
    const ref = new WeakRef(this);
    return this.changes.pipe(
      map(() => {
        return ref.deref().items();
      })
    );
  })();

  readonly keysChanged = (() => {
    const ref = new WeakRef(this);
    return this.changes.pipe(
      map(() => {
        return ref.deref().keys();
      })
    );
  })();

  constructor(
    initialItems?: Iterable<T>,
    config?: {
      keyExpr?: ExtractExpr<T, K>;
      updater?: (newItem: T, oldItem: T) => T;
      canUpdateFn?: (newItem: T, oldItem: T) => boolean;
    }
  ) {
    this._updater = config?.updater;
    this._canUpdateFn = config?.canUpdateFn;
    this._keyGetter = ItemExprUtils.buildGetter(config?.keyExpr);

    this._handleItems(initialItems);
  }

  isEmpty() {
    return this._keysSet.size === 0;
  }

  hasItems() {
    return this._keysSet.size > 0;
  }

  size() {
    return this._keysSet.size;
  }

  items() {
    return Array.from(this._items);
  }

  keys() {
    return Array.from(this._keysSet);
  }

  contains(key: K) {
    return this._keysSet.has(key);
  }

  containsItem(item: T) {
    return this.contains(this._keyGetter(item, this._items.indexOf(item)));
  }

  toggle(item: T) {
    if (this.containsItem(item)) {
      this.removeItem(item);
    } else {
      this.add(item);
    }
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
      this._canUpdateFn
    );
    if (changes?.hasChanges) {
      this._handleKeys();

      this._changesSubject.next(changes);

      return true;
    }

    return false;
  }

  set(items: T[]) {
    if (this._items.length || items?.length) {
      const keysSet = new Set(ArrayUtils.keys(items, this._keyGetter) ?? []);
      const deletes = this.keys().filter((key) => {
        return !keysSet.has(key);
      });

      return this.applyEdits({
        adds: items,
        updates: items,
        deletes,
      });
    }

    return false;
  }

  clear() {
    this.set(null);
  }

  private _handleItems(iterable: Iterable<T>) {
    const items = !iterable
      ? []
      : ArrayUtils.uniqBy(Array.from(iterable), this._keyGetter);

    this._items = items;
    this._handleKeys();
  }

  private _handleKeys() {
    this._keysSet = new Set(ArrayUtils.keys(this._items, this._keyGetter));
  }
}
