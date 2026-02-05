export interface ISetParamsAdapter {
  has(key: string): boolean;
  set(key: string, param: any): void;
  scope(prefix: string | string[]): ISetParamsAdapter;
}
