import { Observable } from "rxjs";
import axios, {
  AxiosDefaults,
  InternalAxiosRequestConfig,
  type AxiosError,
  type AxiosInstance,
  type AxiosInterceptorManager,
  type AxiosRequestConfig,
  type CreateAxiosDefaults,
  type FormSerializerOptions,
  type GenericFormData,
  type GenericHTMLFormElement,
} from "axios";
import { AxiosResponse, HttpEvent } from "./response";

interface Interceptors {
  request: AxiosInterceptorManager<InternalAxiosRequestConfig<any>>;
  response: AxiosInterceptorManager<AxiosResponse<any, any>>;
}

export class RxAxios {
  private axios: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.axios = instance;
  }

  public static isAxiosError<T, D>(error: unknown): error is AxiosError<T, D> {
    return axios.isAxiosError<T, D>(error);
  }

  public static toFormData(
    sourceObj: object,
    targetFormData?: GenericFormData,
    options?: FormSerializerOptions,
  ): GenericFormData {
    return axios.toFormData(sourceObj, targetFormData, options);
  }

  public static formToJSON(
    form: GenericFormData | GenericHTMLFormElement,
  ): object {
    return axios.formToJSON(form);
  }

  public get defaults(): AxiosDefaults<any> {
    return this.axios.defaults;
  }

  public get interceptors(): Interceptors {
    return this.axios.interceptors;
  }

  public request<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    config: AxiosRequestConfig<D> & { reportProgress: true },
  ): Observable<HttpEvent<T>>;
  public request<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    config: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ): Observable<R>;
  public request<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    config: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ) {
    const { axios } = this;

    return observify<T, R, D>(
      (reqConfig) => axios.request<T, R, D>(reqConfig),
      config,
    );
  }

  public get<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    config: AxiosRequestConfig<D> & { reportProgress: true },
  ): Observable<HttpEvent<T>>;
  public get<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ): Observable<R>;
  public get<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ) {
    const { axios } = this;

    return observify<T, R, D>(
      (reqConfig) => axios.get<T, R, D>(url, reqConfig),
      config,
    );
  }

  public delete<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    config: AxiosRequestConfig<D> & { reportProgress: true },
  ): Observable<HttpEvent<T>>;
  public delete<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ): Observable<R>;
  public delete<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ) {
    const { axios } = this;

    return observify<T, R, D>(
      (reqConfig) => axios.delete<T, R, D>(url, reqConfig),
      config,
    );
  }

  public post<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    data: D,
    config: AxiosRequestConfig<D> & { reportProgress: true },
  ): Observable<HttpEvent<T>>;
  public post<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ): Observable<R>;
  public post<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D> & { reportProgress: true },
  ) {
    const { axios } = this;

    return observify<T, R, D>(
      (reqConfig) => axios.post<T, R, D>(url, data, reqConfig),
      config,
    );
  }

  public put<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    data: D,
    config: AxiosRequestConfig<D> & { reportProgress: true },
  ): Observable<HttpEvent<T>>;
  public put<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ): Observable<R>;
  public put<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ) {
    const { axios } = this;

    return observify<T, R, D>(
      (reqConfig) => axios.put<T, R, D>(url, data, reqConfig),
      config,
    );
  }

  public patch<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    data: D,
    config: AxiosRequestConfig<D> & { reportProgress: true },
  ): Observable<HttpEvent<T>>;
  public patch<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ): Observable<R>;
  public patch<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ) {
    const { axios } = this;

    return observify<T, R, D>(
      (reqConfig) => axios.patch<T, R, D>(url, data, reqConfig),
      config,
    );
  }

  public postForm<
    T,
    R extends AxiosResponse<T> = AxiosResponse<T>,
    D = unknown,
  >(
    url: string,
    data: D,
    config: AxiosRequestConfig<D> & { reportProgress: true },
  ): Observable<HttpEvent<T>>;
  public postForm<
    T,
    R extends AxiosResponse<T> = AxiosResponse<T>,
    D = unknown,
  >(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ): Observable<R>;
  public postForm<
    T,
    R extends AxiosResponse<T> = AxiosResponse<T>,
    D = unknown,
  >(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ) {
    const { axios } = this;

    return observify<T, R, D>(
      (reqConfig) => axios.postForm<T, R, D>(url, data, reqConfig),
      config,
    );
  }

  public putForm<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    data: D,
    config: AxiosRequestConfig<D> & { reportProgress: true },
  ): Observable<HttpEvent<T>>;
  public putForm<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ): Observable<R>;
  public putForm<T, R extends AxiosResponse<T> = AxiosResponse<T>, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ) {
    const { axios } = this;

    return observify<T, R, D>(
      (reqConfig) => axios.putForm<T, R, D>(url, data, reqConfig),
      config,
    );
  }

  public patchForm<
    T,
    R extends AxiosResponse<T> = AxiosResponse<T>,
    D = unknown,
  >(
    url: string,
    data: D,
    config: AxiosRequestConfig<D> & { reportProgress: true },
  ): Observable<HttpEvent<T>>;
  public patchForm<
    T,
    R extends AxiosResponse<T> = AxiosResponse<T>,
    D = unknown,
  >(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ): Observable<R>;
  public patchForm<
    T,
    R extends AxiosResponse<T> = AxiosResponse<T>,
    D = unknown,
  >(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
  ) {
    const { axios } = this;

    return observify<T, R, D>(
      (reqConfig) => axios.patchForm<T, R, D>(url, data, reqConfig),
      config,
    );
  }
}

type RequestFn<R, D = unknown> = (config: AxiosRequestConfig<D>) => Promise<R>;

export function observify<T, R extends AxiosResponse<T>, D = unknown>(
  makeRequest: RequestFn<R, D>,
  config?: AxiosRequestConfig<D> & { reportProgress: false },
): Observable<R>;
export function observify<T, R extends AxiosResponse<T>, D = unknown>(
  makeRequest: RequestFn<R, D>,
  config?: AxiosRequestConfig<D> & { reportProgress: true },
): Observable<HttpEvent<T>>;
export function observify<T, R extends AxiosResponse<T>, D = unknown>(
  makeRequest: RequestFn<R, D>,
  config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
): Observable<HttpEvent<T>>;
export function observify<T, R extends AxiosResponse<T>, D = unknown>(
  makeRequest: RequestFn<R, D>,
  config?: AxiosRequestConfig<D> & { reportProgress?: boolean },
): Observable<any> {
  const signal = config?.signal;
  const reportProgress = !!config?.reportProgress;

  config = {
    ...(config ?? {}),
  };

  delete config.reportProgress;
  delete config.signal;
  delete config.cancelToken;

  return new Observable((subscriber) => {
    const controller = new AbortController();

    subscriber.add(() => {
      controller.abort();
    });

    if (signal) {
      const onAbort = () => {
        subscriber.unsubscribe();
      };

      if (signal.aborted) {
        onAbort();
        return;
      }

      signal.addEventListener("abort", onAbort);
      subscriber.add(() => {
        signal.removeEventListener("abort", onAbort);
      });
    }
    const auxConfig = {
      ...config,
      signal: controller.signal,
    };

    if (reportProgress) {
      const onUploadProgress = auxConfig.onUploadProgress;
      const onDownloadProgress = auxConfig.onDownloadProgress;

      auxConfig.onUploadProgress = (e) => {
        onUploadProgress?.(e);

        subscriber.next(e);
      };

      auxConfig.onDownloadProgress = (e) => {
        onDownloadProgress?.(e);

        subscriber.next(e);
      };
    }

    makeRequest(auxConfig)
      .then((response) => {
        subscriber.next(response);
        subscriber.complete();
      })
      .catch((error: unknown) => {
        if (!axios.isCancel(error)) {
          subscriber.error(error);
        } else {
          subscriber.complete();
        }
      });
  });
}
