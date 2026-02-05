import { BaseParamsAdapter } from "../base-params.adapter";
import isObjectLike from "lodash/isObjectLike";

export class FormDataAdapter extends BaseParamsAdapter {
  constructor(public params: FormData) {
    super();
  }

  has(key: string): boolean {
    return this.params.has(key);
  }

  set(key: string, param: any): void {
    if (this.params.has(key)) {
      this.params.delete(key);
    }

    if (param === undefined) {
      return;
    }

    if (Array.isArray(param)) {
      for (let x of param) {
        this._appendInFormData(key, x);
      }
    } else {
      this._setInFormData(key, param);
    }
  }

  private _setInFormData(key: string, param: any) {
    if (param instanceof Blob) {
      if (param instanceof File) {
        this.params.set(key, param, param.name);
      } else {
        this.params.set(key, param);
      }
    } else {
      if (isObjectLike(param)) {
        param = JSON.stringify(param);
      } else {
        param = param?.toString() ?? null;
      }

      this.params.set(key, param);
    }
  }

  private _appendInFormData(key: string, param: any) {
    if (param instanceof Blob) {
      if (param instanceof File) {
        this.params.append(key, param, param.name);
      } else {
        this.params.append(key, param);
      }
    } else {
      if (isObjectLike(param)) {
        param = JSON.stringify(param);
      } else {
        param = param?.toString();
      }

      this.params.append(key, param);
    }
  }
}
