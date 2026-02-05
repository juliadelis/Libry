import { InjectionToken, Provider, Lifecycle } from "tsyringe";

declare type constructor<T> = {
  new (...args: any[]): T;
};
export default constructor;

export type CustomProvider<T = any> =
  | constructor<T>
  | ({
      provide: InjectionToken<T>;
      lifecycle?: Lifecycle;
    } & Provider<T>)
  | CustomProvider<T>[];
