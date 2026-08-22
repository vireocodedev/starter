type UnknownRecord = Record<string, unknown>;
const UNSAFE_OBJECT_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function isPlainObject(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => cloneValue(item)) as T;
  }

  if (isPlainObject(value)) {
    const clone: UnknownRecord = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      if (!UNSAFE_OBJECT_KEYS.has(key)) {
        clone[key] = cloneValue(nestedValue);
      }
    }
    return clone as T;
  }

  return value;
}

/**
 * Recursively merges `override` onto `base`, returning a new value.
 *
 * - Plain objects are merged key-by-key.
 * - Any non-object value (string, number, array, etc.) in `override` replaces
 *   the corresponding value in `base`.
 * - `undefined` values in `override` are ignored, so partial overrides never
 *   erase base keys.
 * - Inputs and nested values are cloned, so callers cannot mutate source
 *   resources through the returned object.
 * - Prototype-mutating keys are ignored.
 *
 * The result always retains the full shape of `base`, which is what guarantees
 * that a partial locale override can never introduce a missing translation key.
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return cloneValue(override === undefined ? base : (override as T));
  }

  const result = cloneValue(base) as UnknownRecord;

  for (const key of Object.keys(override)) {
    if (UNSAFE_OBJECT_KEYS.has(key)) {
      continue;
    }

    const overrideValue = override[key];
    if (overrideValue === undefined) {
      continue;
    }

    const baseValue = result[key];
    result[key] =
      isPlainObject(baseValue) && isPlainObject(overrideValue)
        ? deepMerge(baseValue, overrideValue)
        : cloneValue(overrideValue);
  }

  return result as T;
}
