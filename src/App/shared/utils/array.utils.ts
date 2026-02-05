import remove from "lodash/remove";
import maxBy from "lodash/maxBy";
import minBy from "lodash/minBy";
import chunk from "lodash/chunk";
import { ExtractExpr, ItemExprUtils } from "./item-expr.utils";

export interface EditsOperationsLike<T = any, K = T> {
  adds?: Array<T>;
  addsIndex?: number;
  updates?: Array<T>;
  deletes?: Array<K>;
}

export interface ChangesLike<T> {
  adds?: T[];
  updates?: T[];
  readonly hasChanges: boolean;
}

export interface EditsResultLike<T = any> extends ChangesLike<T> {
  deletes?: T[];
}

class Changes<T> implements ChangesLike<T> {
  get hasChanges() {
    return !!(this.adds?.length || this.updates?.length);
  }

  constructor(
    public adds?: T[],
    public updates?: T[],
  ) {}
}

class EditsResult<T> extends Changes<T> implements EditsResultLike<T> {
  override get hasChanges() {
    return !!(this.deletes?.length || super.hasChanges);
  }

  constructor(
    adds?: T[],
    updates?: T[],
    public deletes?: T[],
  ) {
    super(adds, updates);
  }
}

function sameFn<T>(item: T): T {
  return item;
}

export class ArrayUtils {
  static findRecursive<T = any>(
    items: Iterable<T>,
    getSubItems: (parent: T) => Iterable<T>,
    predicate: (item: T, parent: T, depth: number) => boolean,
    maxDepth = Number.MAX_SAFE_INTEGER,
  ): T {
    const _findRecursive = (parent: T, items: Iterable<T>, depth: number) => {
      if (!items || depth > maxDepth) {
        return;
      }

      for (const item of items) {
        if (predicate(item, parent, depth)) {
          return item;
        }

        const found = _findRecursive(item, getSubItems(item), depth + 1);
        if (found !== undefined) {
          return found;
        }
      }
    };

    return _findRecursive(null, items, 1);
  }

  static findByKey<T = any, K = T>(
    items: Iterable<T>,
    key: K,
    keyExtractor?: ExtractExpr<T, K>,
  ) {
    const getter = ItemExprUtils.buildGetter(keyExtractor);
    const item = Array.prototype.find.call(items, (x, i) => {
      const auxKey = getter(x, i);
      return auxKey === key;
    }) as T;

    return item;
  }

  static findIndexByKey<T = any, K = T>(
    items: Iterable<T>,
    key: K,
    keyExtractor?: ExtractExpr<T, K>,
  ) {
    const getter = ItemExprUtils.buildGetter(keyExtractor);
    const index = Array.prototype.findIndex.call(items, (x, i) => {
      const auxKey = getter(x, i);
      return auxKey === key;
    });

    return index;
  }

  static existsByKey<T = any, K = T>(
    items: Iterable<T>,
    key: K,
    keyExtractor?: ExtractExpr<T, K>,
  ) {
    return ArrayUtils.findIndexByKey(items, key, keyExtractor) > -1;
  }

  static keys<T = any, K = T>(items: T[], keyExtractor?: ExtractExpr<T, K>) {
    const getter = ItemExprUtils.buildGetter(keyExtractor);
    const keys = items?.map<K>(getter);
    return keys;
  }

  static maxBy<T>(array: T[], keyExtractor?: ExtractExpr<T>) {
    const getter = ItemExprUtils.buildGetter(keyExtractor);

    return maxBy(array, (x) => {
      return getter(x, null);
    });
  }

  static minBy<T>(array: T[], keyExtractor?: ExtractExpr<T>) {
    const getter = ItemExprUtils.buildGetter(keyExtractor);

    return minBy(array, (x) => {
      return getter(x, null);
    });
  }

  static chunk<T>(array: T[], size: number) {
    if (!array) {
      return null;
    }

    return chunk(array, size);
  }

  static move<T>(array: T[], sourceIndex: number, targetIndex: number): T[] {
    if (sourceIndex !== targetIndex) {
      let aux = array[sourceIndex];
      let aux2: T;
      let aux3: T;

      let i = targetIndex;
      if (sourceIndex < targetIndex) {
        while (i >= sourceIndex) {
          aux2 = array[i];
          array[i] = aux3;
          aux3 = aux2;
          --i;
        }
      } else {
        while (i <= sourceIndex) {
          aux2 = array[i];
          array[i] = aux3;
          aux3 = aux2;
          ++i;
        }
      }

      array[targetIndex] = aux;
    }

    return array;
  }

  static addInIndexOrUpdate<T>(
    array: T[],
    item: T,
    index: number,
    keyExtractor?: ExtractExpr<T>,
    updater?: (newItem: T, oldItem: T) => T,
    canUpdateFn?: (newItem: T, oldItem: T) => boolean,
  ): ChangesLike<T> {
    return ArrayUtils.addInIndexOrUpdateRange(
      array,
      [item],
      index,
      keyExtractor,
      updater,
      canUpdateFn,
    );
  }

  static addInIndexOrUpdateRange<T>(
    array: T[],
    items: T[],
    index: number,
    keyExtractor?: ExtractExpr<T>,
    updater?: (newItem: T, oldItem: T) => T,
    canUpdateFn?: (newItem: T, oldItem: T) => boolean,
  ): ChangesLike<T> {
    const changes = ArrayUtils.applyEdits(
      array,
      { adds: items, addsIndex: index, updates: items },
      keyExtractor,
      updater,
      canUpdateFn,
    );

    return changes;
  }

  static addOrUpdate<T>(
    array: T[],
    item: T,
    keyExtractor?: ExtractExpr<T>,
    updater?: (newItem: T, oldItem: T) => T,
    canUpdateFn?: (newItem: T, oldItem: T) => boolean,
  ): ChangesLike<T> {
    return ArrayUtils.addOrUpdateRange(
      array,
      [item],
      keyExtractor,
      updater,
      canUpdateFn,
    );
  }

  static addOrUpdateRange<T>(
    array: T[],
    items: T[],
    keyExtractor?: ExtractExpr<T>,
    updater?: (newItem: T, oldItem: T) => T,
    canUpdateFn?: (newItem: T, oldItem: T) => boolean,
  ): ChangesLike<T> {
    const changes = ArrayUtils.applyEdits(
      array,
      { adds: items, updates: items },
      keyExtractor,
      updater,
      canUpdateFn,
    );

    return changes;
  }

  static addRangeInIndex<T>(
    array: T[],
    items: T[],
    index: number,
    keyExtractor?: ExtractExpr<T>,
  ): T[] {
    const { adds } = ArrayUtils.applyEdits(
      array,
      { adds: items, addsIndex: index },
      keyExtractor,
    );

    return adds;
  }

  static addInIndex<T>(
    array: T[],
    item: T,
    index: number,
    keyExtractor?: ExtractExpr<T>,
  ): boolean {
    const adds = ArrayUtils.addRangeInIndex(array, [item], index, keyExtractor);
    return adds?.length > 0;
  }

  static add<T>(array: T[], item: T, keyExtractor?: ExtractExpr<T>): boolean {
    const adds = ArrayUtils.addRange(array, [item], keyExtractor);
    return adds?.length > 0;
  }

  static addRange<T>(
    array: T[],
    items: T[],
    keyExtractor?: ExtractExpr<T>,
  ): T[] {
    const { adds } = ArrayUtils.applyEdits(
      array,
      { adds: items },
      keyExtractor,
    );

    return adds;
  }

  static update<T>(
    array: T[],
    item: T,
    keyExtractor?: ExtractExpr<T>,
    updater?: (newItem: T, oldItem: T) => T,
    canUpdateFn?: (newItem: T, oldItem: T) => boolean,
  ): boolean {
    const updates = ArrayUtils.updateRange(
      array,
      [item],
      keyExtractor,
      updater,
      canUpdateFn,
    );
    return updates?.length > 0;
  }

  static updateRange<T>(
    array: T[],
    items: T[],
    keyExtractor?: ExtractExpr<T>,
    updater?: (newItem: T, oldItem: T) => T,
    canUpdateFn?: (newItem: T, oldItem: T) => boolean,
  ): T[] {
    const { updates } = ArrayUtils.applyEdits(
      array,
      { updates: items },
      keyExtractor,
      updater,
      canUpdateFn,
    );

    return updates;
  }

  static removeItem<T>(items: T[], item: T, keyExtractor?: ExtractExpr<T>) {
    const results = ArrayUtils.removeItems(items, [item], keyExtractor);
    return results.length > 0;
  }

  static removeItems<T>(
    items: T[],
    itemsToRemoved: T[],
    keyExtractor?: ExtractExpr<T>,
  ): T[] {
    const keys = ArrayUtils.keys(itemsToRemoved, keyExtractor);
    return ArrayUtils.removeItemsByKeys(items, keys, keyExtractor);
  }

  static removeItemsByKey<T, K = any>(
    items: T[],
    key: K,
    keyExtractor?: ExtractExpr<T>,
  ) {
    return ArrayUtils.removeItemsByKeys(items, [key], keyExtractor);
  }

  static removeItemsByKeys<T, K = any>(
    items: T[],
    keysToRemoved: K[],
    keyExpr: ExtractExpr<T>,
  ): T[] {
    const keyExtractor = ItemExprUtils.buildGetter(keyExpr);

    const keySet = keysToRemoved.reduce((acc, key) => {
      acc.add(key);
      return acc;
    }, new Set());
    const results = ArrayUtils.removeItemsBy(items, (x, index) =>
      keySet.has(keyExtractor(x, index)),
    );
    return results;
  }

  static removeItemsBy<T>(
    items: T[],
    predicate: (item: T, index: number) => boolean,
  ): T[] {
    const results = remove(items, predicate);
    return results;
  }

  static applyEdits<T>(
    items: T[],
    edits: EditsOperationsLike<T, any>,
    keyExpr?: ExtractExpr<T>,
    updater?: (newItem: T, oldItem: T) => T,
    canUpdateFn?: (newItem: T, oldItem: T) => boolean,
  ): EditsResultLike<T> {
    const keyExtractor = ItemExprUtils.buildGetter(keyExpr);

    let addsHolderList = ArrayUtils.uniqBy(
      edits?.adds?.map((item, index) => {
        return {
          key: keyExtractor(item, index),
          item,
        };
      }),
      (x) => x.key,
    );
    let updates = edits?.updates?.map((item, index) => {
      return {
        key: keyExtractor(item, index),
        item,
      };
    });
    let deleteKeys = edits?.deletes;

    let deletedItems: T[];

    if (deleteKeys?.length) {
      deletedItems = ArrayUtils.removeItemsByKeys(
        items,
        deleteKeys,
        keyExtractor,
      );
    }

    const itemsKeyedMap = !(updates?.length || addsHolderList?.length)
      ? null
      : items.reduce((acc, item, index) => {
          acc.set(keyExtractor(item, index), {
            item,
            index,
          });
          return acc;
        }, new Map());

    let itemsUpdated;

    if (updates?.length) {
      updater = updater ?? sameFn;
      canUpdateFn = canUpdateFn ?? (() => true);

      const itemsUpdatedKeyedMap = new Map();

      let newItemKeyed;
      let itemKeyed;
      let item;
      for (let i = 0; i < updates.length; ++i) {
        newItemKeyed = updates[i];
        itemKeyed = itemsKeyedMap.get(newItemKeyed.key);
        if (itemKeyed && canUpdateFn(newItemKeyed.item, itemKeyed.item)) {
          item = updater(newItemKeyed.item, itemKeyed.item);
          items[itemKeyed.index] = item;
          itemKeyed.item = item;

          itemsUpdatedKeyedMap.set(newItemKeyed.key, item);
        }
      }

      itemsUpdated = Array.from(itemsUpdatedKeyedMap, ([, item]) => item);
    }

    let adds: T[];
    if (addsHolderList?.length) {
      adds = addsHolderList
        .filter((x) => !itemsKeyedMap.has(x.key))
        .map((x) => x.item);

      if (adds.length) {
        const index = edits.addsIndex ?? items.length;
        items.splice(index, 0, ...adds);
      }
    }

    return new EditsResult(adds, itemsUpdated, deletedItems);
  }

  static uniqBy<T>(items: T[], keyExtractor?: ExtractExpr<T>): T[] {
    if (items) {
      const getter = ItemExprUtils.buildGetter(keyExtractor);

      const keySet = new Set();
      const list = new Array<T>();

      let key;
      let item;
      for (let i = 0; i < items.length; ++i) {
        item = items[i];
        key = getter(item, i);

        if (!keySet.has(key)) {
          list.push(item);
          keySet.add(key);
        }
      }

      return list;
    } else {
      return null;
    }
  }

  static groupBy<T, K>(
    items: T[],
    keyExtractor: ExtractExpr<T, K>,
  ): Map<K, T[]> {
    if (items) {
      const getter = ItemExprUtils.buildGetter(keyExtractor);

      const groupMap = new Map<K, T[]>();

      let key;
      let item;
      let list: Array<T>;
      for (let i = 0; i < items.length; ++i) {
        item = items[i];
        key = getter(item, i);

        if (groupMap.has(key)) {
          list = groupMap.get(key);
        } else {
          list = [];
          groupMap.set(key, list);
        }

        list.push(item);
      }

      return groupMap;
    } else {
      return null;
    }
  }
}
