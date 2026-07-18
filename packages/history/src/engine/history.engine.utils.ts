export function getObjectFieldValue(value: unknown, fieldName: string): unknown {
  if (value == null || typeof value !== "object") {
    return undefined;
  }

  return (value as Record<string, unknown>)[fieldName];
}

export function isEmptyHistoryValue(value: unknown): boolean {
  return value == null || value === "";
}

export function isPrimitiveIdentityValue(value: unknown): value is string | number {
  return typeof value === "string" || typeof value === "number";
}

export function areHistoryValuesEqual(previous: unknown, current: unknown): boolean {
  if (Object.is(previous, current)) {
    return true;
  }

  if (typeof previous !== typeof current) {
    return false;
  }

  if (previous == null || current == null) {
    return false;
  }

  if (typeof previous !== "object") {
    return false;
  }

  return stableStringify(previous) === stableStringify(current);
}

export function stableStringify(value: unknown): string | undefined {
  try {
    return JSON.stringify(sortObjectKeysDeep(value));
  } catch {
    return undefined;
  }
}

export function sortObjectKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeysDeep);
  }

  if (value == null || typeof value !== "object") {
    return value;
  }

  const sortedEntries = Object.entries(value as Record<string, unknown>)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, entryValue]) => [key, sortObjectKeysDeep(entryValue)]);

  return Object.fromEntries(sortedEntries);
}
