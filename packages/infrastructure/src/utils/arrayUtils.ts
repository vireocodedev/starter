type StripNullishAndFalse<T> = Exclude<T, null | undefined | false>;

export function findFirstTruthy<T>(arr: Array<T>): StripNullishAndFalse<T> | undefined {
  for (const item of arr) {
    if (item) return item as StripNullishAndFalse<T>;
  }
  return undefined;
}
