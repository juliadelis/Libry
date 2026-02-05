import {
  AxiosProgressEvent,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponseHeaders,
  type AxiosResponse as OriginalAxiosResponse,
} from "axios";
import { Observable } from "rxjs";

export type AxiosResponse<T, D = unknown> = OriginalAxiosResponse<T, D>;

export type AxiosObservable<T> = Observable<AxiosResponse<T>>;

export type AxiosRequestTransformer<T> = (
  this: AxiosRequestConfig<T>,
  data: T,
  headers: AxiosRequestHeaders,
) => T;

export type AxiosResponseTransformer<T> = (
  this: AxiosRequestConfig<T>,
  data: T,
  headers: AxiosResponseHeaders,
  status?: number,
) => T;

export type HttpEvent<T, D = unknown> =
  | AxiosResponse<T, D>
  | AxiosProgressEvent;
