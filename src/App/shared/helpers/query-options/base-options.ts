import { AbstractOptions } from "./abstract-options";
import cloneDeep from "lodash/cloneDeep";

export abstract class BaseOptions<
  I,
  T extends BaseOptions<any, any>
> extends AbstractOptions {
  constructor(options?: Partial<I>) {
    super();
    this.reset(options);
  }

  patch(options: Partial<I>) {
    const keys = Object.keys(options);
    for (let key of keys) {
      this.patchByKey(key as any, options[key]);
    }

    return this;
  }

  patchByKey(key: keyof I, value: any) {
    if (key in this) {
      this[key as any] = value;
    }

    return this;
  }

  clone(): T {
    return cloneDeep(this) as any;
  }

  abstract reset(options?: Partial<I>): void;
}
