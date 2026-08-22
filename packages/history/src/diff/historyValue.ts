import type { HistoryFormatContext } from "../definitions/historyDefinition.types";
import type { HistoryValue } from "./historyNode.types";

export function isHistoryValuePresent(value: unknown): boolean {
  return value !== null && value !== undefined;
}

export function formatHistoryValue<TParent>(
  raw: unknown,
  format: ((value: never, context: HistoryFormatContext<TParent>) => string) | undefined,
  context: HistoryFormatContext<TParent>,
): HistoryValue {
  const formatted = format == null ? formatDefaultHistoryValue(raw) : format(raw as never, context);

  if (typeof formatted !== "string") {
    throw new TypeError(`History formatter at "${context.path.join(".") || "$root"}" must return a string.`);
  }

  return { raw, formatted };
}

export function formatDefaultHistoryValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
  if (value instanceof Date) return value.toISOString();

  return stableStringify(value) ?? String(value);
}

export function areHistoryValuesEqual(previous: unknown, current: unknown): boolean {
  if (Object.is(previous, current)) return true;
  if (typeof previous !== typeof current || previous == null || current == null) return false;
  if (typeof previous !== "object") return false;

  return stableStringify(previous) === stableStringify(current);
}

export function stableStringify(value: unknown): string | undefined {
  try {
    return JSON.stringify(sortObjectKeysDeep(value));
  } catch {
    return undefined;
  }
}

function sortObjectKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObjectKeysDeep);
  if (value == null || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
      .map(([key, entryValue]) => [key, sortObjectKeysDeep(entryValue)]),
  );
}
