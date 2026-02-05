import { injectable, injectAll, InjectionToken } from "tsyringe";

export type BootstrapFn = () =>
  | void
  | Promise<void>
  | (() => void | Promise<void>);

export const APP_BOOTSTRAP: InjectionToken<BootstrapFn> =
  Symbol("APP_BOOTSTRAP");

@injectable()
export class AppBootstrapManager {
  constructor(@injectAll(APP_BOOTSTRAP) private fnList: BootstrapFn[]) {}

  async bootstrap() {
    const promises = new Array<Promise<any>>();

    for (const fn of this.fnList) {
      let res = fn?.();

      if (typeof res === "function") {
        res = res();
      }

      if (res instanceof Promise) {
        promises.push(res);
      }
    }

    await Promise.all(promises);
  }
}
