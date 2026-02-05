import { ArrayDataSource } from "../../helpers/datasources/custom-array-datasource";
import { CustomDataSource } from "../../helpers/datasources/custom-datasource";
import { CustomRawDataSource } from "../../helpers/datasources/custom-raw-datasource";
import { DataSourceUtils } from "../../helpers/datasources/datasource.utils";
import {
  ArrayDataSourceLike,
  CustomDataSourceLike,
  RawDataSourceLike,
} from "../../helpers/datasources/types";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useStateRef } from "../../hooks/useStateRef";
import { useRxObservableEffect } from "../../hooks/rxjs-interop";

export type DataSourceInput<T> =
  | ArrayDataSourceLike<T>
  | RawDataSourceLike<T>
  | CustomDataSourceLike<T>;

export function useDataSourceFactory<T = any>(
  dataSourceLikeOrFactory:
    | ArrayDataSourceLike<T>
    | (() => ArrayDataSourceLike<T>),
  deps?: React.DependencyList,
): ArrayDataSource<T>;
export function useDataSourceFactory<T = any>(
  dataSourceLikeOrFactory: RawDataSourceLike<T> | (() => RawDataSourceLike<T>),
  deps?: React.DependencyList,
): CustomRawDataSource<T>;
export function useDataSourceFactory<T = any>(
  dataSourceLikeOrFactory:
    | CustomDataSourceLike<T>
    | (() => CustomDataSourceLike<T>),
  deps?: React.DependencyList,
): CustomDataSource<T>;
export function useDataSourceFactory<T = any>(
  dataSourceLikeOrFactory: DataSourceInput<T> | (() => DataSourceInput<T>),
  deps?: React.DependencyList,
) {
  deps = [1, ...(deps ?? [])];

  const holderRef = useRef<HolderLike<T>>(null);
  const dataSourceHolder = useMemo<HolderLike<T>>(() => {
    disposeDataSourceHolder(holderRef.current);

    const factoryMode = typeof dataSourceLikeOrFactory === "function";

    const dataSourceLike = factoryMode
      ? dataSourceLikeOrFactory()
      : dataSourceLikeOrFactory;

    const dataSource = DataSourceUtils.parse<T>(dataSourceLike as any) as any;
    return {
      dataSource,
      shouldDispose: factoryMode || dataSource !== dataSourceLike,
    };
  }, deps);

  holderRef.current = dataSourceHolder;

  useLayoutEffect(() => {
    const holderAux = dataSourceHolder;

    return () => {
      disposeDataSourceHolder(holderAux);
    };
  }, [dataSourceHolder]);

  return holderRef.current.dataSource as any;
}

export function useDataSource<T>(dataSourceLikeOrFactory: DataSourceInput<T>) {
  const dataSource = useDataSourceFactory(dataSourceLikeOrFactory as any, [
    dataSourceLikeOrFactory,
  ]) as any as CustomDataSource<T>;

  const data = useStateRef(
    () => {
      return [] as T[];
    },
    {
      deps: [dataSource],
    },
  );

  useRxObservableEffect(
    () => {
      if (dataSource?.disposed) {
        return null;
      }

      return dataSource?.toObservable?.();
    },
    (list) => {
      data.set(list);
    },
    [dataSource],
  );

  return { dataSource, data };
}

type HolderLike<T> = {
  dataSource: CustomDataSource<T>;
  shouldDispose: boolean;
};
function disposeDataSourceHolder<T>(holder: HolderLike<T>) {
  if (holder?.shouldDispose) {
    holder?.dataSource?.dispose();
  }
}
