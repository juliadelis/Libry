import { BaseParamsAdapter } from "../base-params.adapter";

export class URLSearchParamsAdapter extends BaseParamsAdapter {
  constructor(public params: URLSearchParams) {
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
        this.params.append(key, resolveValue(x));
      }
    } else {
      this.params.set(key, resolveValue(param));
    }
  }
}

function resolveValue(value: any): string {
  if (value instanceof Date) {
    value = value.toISOString();
  }

  return String(value);
}
