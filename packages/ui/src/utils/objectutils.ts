export function omitKeys<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export const EMPTY_ARRAY: [] = [];

export function filterOptionsNoop<T>(item: T): T {
  return item;
}

export const BOOLEAN_ARRAY: [true, false] = [true, false];
