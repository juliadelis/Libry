import { ItemExprUtils } from "../../../utils/item-expr.utils";
import { BaseParamsAdapter } from "../base-params.adapter";

export class BodyParamsAdapter<
  I extends object = any
> extends BaseParamsAdapter {
  constructor(public params: I) {
    super();
  }

  has(key: string): boolean {
    return key in this.params;
  }

  set(key: string, param: any): void {
    if (param === undefined) {
      ItemExprUtils.unset(this.params, key);
      return;
    }

    ItemExprUtils.setValue(this.params, param, key);
  }
}
