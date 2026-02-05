import { BaseOptions } from "../base-options";
import { ISetParamsAdapter } from "../interfaces";

export interface PageOptionsLike {
  skip?: number;
  take?: number;

  skipOptional?: number;
  takeOptional?: number;
}

export class PageOptions
  extends BaseOptions<PageOptionsLike, PageOptions>
  implements PageOptionsLike
{
  skip?: number;
  take?: number;

  skipOptional?: number;
  takeOptional?: number;

  setSkip(skip: number) {
    this.skip = skip;
    return this;
  }

  setTake(take: number) {
    this.take = take;
    return this;
  }

  setSkipOptional(skipOptional: number) {
    this.skipOptional = skipOptional;
    return this;
  }

  setTakeOptional(takeOptional: number) {
    this.takeOptional = takeOptional;
    return this;
  }

  getSkip() {
    return this.skip ?? this.skipOptional;
  }

  getTake() {
    return this.take ?? this.takeOptional;
  }

  override reset(options?: Partial<PageOptionsLike>): void {
    this.skip = options?.skip;
    this.take = options?.take;

    this.skipOptional = options?.skipOptional;
    this.takeOptional = options?.takeOptional;
  }

  protected _handleParamsAdapter(paramsAdapter: ISetParamsAdapter): void {
    const skip = this.getSkip();
    if (typeof skip === "number") {
      paramsAdapter.set("offset", skip);
    }

    const take = this.getTake();
    if (typeof take === "number") {
      paramsAdapter.set("limit", take);
    }
  }
}
