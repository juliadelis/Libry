import { injectable, Disposable as DIDisposable } from "tsyringe";

@injectable()
export class DestroyRef implements Disposable, DIDisposable {
  private callbackRegistry = new Set<Function>();

  private _disposed = false;

  get disposed() {
    return this._disposed;
  }

  dispose(): Promise<void> | void {
    if (this.disposed) {
      return;
    }

    this._disposed = true;

    const list = Array.from(this.callbackRegistry);
    for (let fn of list) {
      fn();
    }

    this.callbackRegistry.clear();
  }

  [Symbol.dispose](): void {
    this.dispose();
  }

  onDestroy(fn: () => void) {
    if (this.disposed) {
      fn();
    } else {
      this.callbackRegistry.add(fn);
    }

    return () => {
      this.callbackRegistry.delete(fn);
    };
  }
}
