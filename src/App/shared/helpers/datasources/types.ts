import { Observable } from "rxjs";
import {
  CustomDataSource,
  IDataLoadOptions,
  IDataSourceOptions,
} from "./custom-datasource";
import { PageResults } from "./classes";
import {
  CustomRawDataSource,
  IRawDataSourceOptions,
} from "./custom-raw-datasource";
import {
  ArrayDataSource,
  IArrayDataSourceOptions,
} from "./custom-array-datasource";

export type MaybeAsync<T> = T | Observable<T> | Promise<T>;

export type DataSourceValueLike<T> =
  | MaybeAsync<T[]>
  | MaybeAsync<PageResults<T>>;

export type DataSourceValueFnLike<T> = (
  options: IDataLoadOptions,
) => DataSourceValueLike<T>;

export type CustomDataSourceLike<T> =
  | CustomDataSource<T>
  | IDataSourceOptions<T>
  | MaybeAsync<PageResults<T>>;

export type RawDataSourceValueFnLike<T> = () => MaybeAsync<T[]>;

export type RawDataSourceLike<T> =
  | CustomRawDataSource<T>
  | IRawDataSourceOptions<T>
  | MaybeAsync<T[]>;

export type ArrayDataSourceLike<T> =
  | T[]
  | ArrayDataSource<T>
  | IArrayDataSourceOptions<T>;

export type DataSourceLike<T> =
  | DataSourceValueLike<T>
  | CustomDataSourceLike<T>
  | DataSourceValueFnLike<T>
  | RawDataSourceLike<T>
  | RawDataSourceValueFnLike<T>
  | ArrayDataSourceLike<T>;
