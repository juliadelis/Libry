import { ISetParamsAdapter } from "./interfaces";

export abstract class BaseParamsAdapter implements ISetParamsAdapter {
  abstract has(key: string): boolean;
  abstract set(key: string, param: any): void;

  scope(prefix: string | string[]): ISetParamsAdapter {
    return new ScopedParamsAdapter(prefix, this);
  }
}

class ScopedParamsAdapter extends BaseParamsAdapter {
  private path: string[];

  constructor(path: string[] | string, private adapter: ISetParamsAdapter) {
    super();

    if (typeof path === "string") {
      path = path.split(".");
    }

    this.path = path;
  }

  has(key: string): boolean {
    key = this.resolveKey(key);

    return this.adapter.has(key);
  }

  set(key: string, param: any): void {
    key = this.resolveKey(key);

    this.adapter.set(key, param);
  }

  private resolveKey(key: string): string {
    if (this.path?.length) {
      key = this.path.join(".") + "." + key;
    }

    return key;
  }
}
