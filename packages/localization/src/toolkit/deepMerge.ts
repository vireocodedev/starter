type UnknownRecord = Record<string, unknown>;

function isPlainObject(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Recursively merges `override` onto `base`, returning a new value.
 *
 * - Plain objects are merged key-by-key.
 * - Any non-object value (string, number, array, etc.) in `override` replaces
 *   the corresponding value in `base`.
 * - `undefined` values in `override` are ignored, so partial overrides never
 *   erase base keys.
 *
 * The result always retains the full shape of `base`, which is what guarantees
 * that a partial locale override can never introduce a missing translation key.
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override === undefined ? base : (override as T);
  }

  const result: UnknownRecord = { ...base };

  for (const key of Object.keys(override)) {
    const overrideValue = override[key];
    if (overrideValue === undefined) {
      continue;
    }

    const baseValue = result[key];
    result[key] =
      isPlainObject(baseValue) && isPlainObject(overrideValue) ? deepMerge(baseValue, overrideValue) : overrideValue;
  }

  return result as T;
}
