export interface ApplyEditsOperationsLike<T = any, K = T> {
  adds?: Array<T>;
  edits?: Array<T>;
  deletes?: Array<K>;
}

export interface OptionLike<T = string> {
  value: T;
  text: string;
}
