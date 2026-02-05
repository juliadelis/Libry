import { Observable } from "rxjs";
import { CustomDataSource } from "./custom-datasource";
import { CustomRawDataSource } from "./custom-raw-datasource";
import {
  ArrayDataSourceLike,
  CustomDataSourceLike,
  DataSourceLike,
  DataSourceValueFnLike,
  RawDataSourceLike,
  RawDataSourceValueFnLike,
} from "./types";
import { ArrayDataSource } from "./custom-array-datasource";

export class DataSourceUtils {
  static parse<T>(source: ArrayDataSourceLike<T>): ArrayDataSource<T>;
  static parse<T>(
    source: RawDataSourceLike<T> | RawDataSourceValueFnLike<T>,
  ): CustomRawDataSource<T>;
  static parse<T>(
    source: CustomDataSourceLike<T> | DataSourceValueFnLike<T>,
  ): CustomDataSource<T>;
  static parse<T>(
    source: DataSourceLike<T>,
  ): CustomDataSource<T>;
  static parse<T>(source: DataSourceLike<T>) {
    if (source instanceof CustomDataSource) {
      return source;
    }

    if (source && typeof source === "object" && "data" in source) {
      return new ArrayDataSource(source);
    } else if (Array.isArray(source)) {
      return new ArrayDataSource({
        data: source,
      });
    } else if (source instanceof Observable || source instanceof Promise) {
      return new CustomRawDataSource<T>({
        load: () => {
          return source;
        },
      });
    } else if (typeof (source as any)?.load === "function") {
      if ((source as any).load.length === 0) {
        return new CustomRawDataSource(source as any);
      } else {
        return new CustomDataSource(source as any);
      }
    } else {
      return new CustomRawDataSource({
        load: () => {
          return (source ?? []) as any;
        },
      });
    }
  }
}
