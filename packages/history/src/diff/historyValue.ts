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

  return stringifyHistoryValueForDisplay(value);
}

export function areHistoryValuesEqual(previous: unknown, current: unknown): boolean {
  if (Object.is(previous, current)) return true;
  if (typeof previous !== typeof current || previous == null || current == null) return false;
  if (typeof previous !== "object") return false;

  return stableStringify(previous) === stableStringify(current);
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(createCanonicalHistoryValue(value, new Set<object>()));
}

type CanonicalHistoryValue = readonly [type: string, value?: unknown];

function createCanonicalHistoryValue(value: unknown, ancestors: Set<object>): CanonicalHistoryValue {
  if (value === null) return ["null"];
  if (value === undefined) return ["undefined"];

  switch (typeof value) {
    case "string":
      return ["string", value];
    case "boolean":
      return ["boolean", value];
    case "bigint":
      return ["bigint", value.toString()];
    case "number":
      return ["number", serializeNumber(value)];
    case "symbol":
    case "function":
      throw new TypeError(`History values do not support ${typeof value} values.`);
    case "object":
      break;
    default:
      return ["unknown", String(value)];
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new TypeError("History values do not support invalid Date values.");
    return ["date", value.toISOString()];
  }

  assertSupportedObject(value);
  if (ancestors.has(value)) throw new TypeError("History values must not contain cyclic references.");

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return ["array", value.map(entry => createCanonicalHistoryValue(entry, ancestors))];
    }

    return [
      "object",
      Object.entries(value as Record<string, unknown>)
        .sort(([leftKey], [rightKey]) => compareKeys(leftKey, rightKey))
        .map(([key, entryValue]) => [key, createCanonicalHistoryValue(entryValue, ancestors)]),
    ];
  } finally {
    ancestors.delete(value);
  }
}

function stringifyHistoryValueForDisplay(value: unknown): string {
  return JSON.stringify(createDisplayHistoryValue(value, new Set<object>()));
}

function createDisplayHistoryValue(value: unknown, ancestors: Set<object>): unknown {
  if (value == null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : String(value);
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "symbol" || typeof value === "function") {
    throw new TypeError(`History values do not support ${typeof value} values.`);
  }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new TypeError("History values do not support invalid Date values.");
    return value.toISOString();
  }

  assertSupportedObject(value);
  if (ancestors.has(value)) throw new TypeError("History values must not contain cyclic references.");

  ancestors.add(value);
  try {
    if (Array.isArray(value)) return value.map(entry => createDisplayHistoryValue(entry, ancestors));

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([leftKey], [rightKey]) => compareKeys(leftKey, rightKey))
        .map(([key, entryValue]) => [key, createDisplayHistoryValue(entryValue, ancestors)]),
    );
  } finally {
    ancestors.delete(value);
  }
}

function serializeNumber(value: number): number | string {
  if (Number.isNaN(value)) return "NaN";
  if (value === Number.POSITIVE_INFINITY) return "Infinity";
  if (value === Number.NEGATIVE_INFINITY) return "-Infinity";
  if (Object.is(value, -0)) return "-0";
  return value;
}

function assertSupportedObject(value: object): void {
  if (Array.isArray(value)) return;
  const prototype = Object.getPrototypeOf(value);
  if (prototype === Object.prototype || prototype === null) return;

  const constructorName = value.constructor?.name ?? "unknown";
  throw new TypeError(`History values do not support object type "${constructorName}".`);
}

function compareKeys(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}
