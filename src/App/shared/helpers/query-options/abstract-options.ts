import { BodyParamsAdapter } from "./adapters/body-params.adapter";
import { ISetParamsAdapter } from "./interfaces";
import { FormDataAdapter } from "./adapters/form-data.adapter";
import { URLSearchParamsAdapter } from "./adapters/url-search-params.adapter";

export abstract class AbstractOptions {
  toPlainObject<I extends object = any>(params?: I) {
    const adapter = new BodyParamsAdapter<I>(params ?? ({} as any));

    this._handleParamsAdapter(adapter);

    return adapter.params;
  }

  toFormDataParams(params?: FormData) {
    const adapter = new FormDataAdapter(params ?? new FormData());

    this._handleParamsAdapter(adapter);

    return adapter.params;
  }

  toURLSearchParams(params?: URLSearchParams) {
    const adapter = new URLSearchParamsAdapter(params ?? new URLSearchParams());

    this._handleParamsAdapter(adapter);

    return adapter.params;
  }

  applyTo(paramsAdapter: ISetParamsAdapter) {
    this._handleParamsAdapter(paramsAdapter);
  }

  protected abstract _handleParamsAdapter(
    paramsAdapter: ISetParamsAdapter,
  ): void;
}
