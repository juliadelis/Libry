import lodashGet from 'lodash/get';
import lodashSet from 'lodash/set';
import lodashUnset from 'lodash/unset';

export type ExtractExprFn<T = any, K = any> = (item: T, index: number) => K;

export type ExtractExpr<T = any, K = any> =
  | ExtractExprFn<T, K>
  | string
  | keyof T;

interface TrackByFunction<T> {
  /**
   * @param index The index of the item within the iterable.
   * @param item The item in the iterable.
   */
  <U extends T>(index: number, item: T & U): any;
}

function defaultGetter<T>(item: T) {
  return item;
}

function defaultSetter<T, K>(item: T, value: K) {}

export type SetExprFn<T = any, K = any> = (item: T, value: K) => void;

export type SetExpr<T = any, K = any> = SetExprFn<T, K> | string | keyof T;

export class ItemExprUtils {
  static buildGetter<T = any, K = any>(valueExpr?: ExtractExpr<T, K>) {
    if (valueExpr) {
      if (typeof valueExpr === 'function') {
        return valueExpr;
      } else {
        return (item: T) => {
          return !item ? null : lodashGet(item, valueExpr);
        };
      }
    }

    return defaultGetter;
  }

  static buildSetter<T = any, K = any>(setExpr?: SetExpr<T, K>) {
    if (setExpr) {
      if (typeof setExpr === 'function') {
        return setExpr;
      } else {
        return (item: T, value: K) => {
          lodashSet(item as any, setExpr, value);
        };
      }
    }

    return defaultSetter;
  }

  static setValue<T = any, K = any>(
    item: T,
    value: K,
    setExpr?: SetExpr<T, K>
  ) {
    ItemExprUtils.buildSetter(setExpr)(item, value);
  }

  static extractValue<T = any, K = any>(
    item: T,
    index: number,
    valueExpr?: ExtractExpr<T, K>
  ) {
    return ItemExprUtils.buildGetter(valueExpr)(item, index);
  }

  static unset(source: any, path: string): boolean {
    return lodashUnset(source, path);
  }

  static trackByFunction<T, K = any>(
    keyExpr: ExtractExpr<T, K>
  ): TrackByFunction<T> {
    const extractor = ItemExprUtils.buildGetter(keyExpr);

    return (index: number, item: T) => {
      const key = extractor(item, index);
      return key;
    };
  }
}
