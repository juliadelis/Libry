import { AbstractOptions } from "../abstract-options";
import { ISetParamsAdapter } from "../interfaces";

export class CustomOptions extends AbstractOptions {
  constructor(
    private paramsAdapterFn: (paramsAdapter: ISetParamsAdapter) => void,
  ) {
    super();
  }

  protected _handleParamsAdapter(paramsAdapter: ISetParamsAdapter): void {
    this.paramsAdapterFn?.(paramsAdapter);
  }
}
