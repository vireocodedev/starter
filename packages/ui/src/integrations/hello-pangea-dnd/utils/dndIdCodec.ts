import type { VireoDndJsonValue } from "@/integrations/hello-pangea-dnd/types/dnd.types";

const IDENTIFIER_PREFIX = "vireo-dnd:";

function normalizeJsonValue(value: unknown, path: string, seen: Set<object>): VireoDndJsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError(`Vireo DnD identifier at ${path} contains a non-finite number.`);
    return value;
  }

  if (typeof value !== "object") {
    throw new TypeError(`Vireo DnD identifier at ${path} contains unsupported ${typeof value} data.`);
  }

  if (seen.has(value)) throw new TypeError(`Vireo DnD identifier at ${path} contains a circular reference.`);
  seen.add(value);

  try {
    if (Array.isArray(value)) return value.map((entry, index) => normalizeJsonValue(entry, `${path}[${index}]`, seen));

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`Vireo DnD identifier at ${path} must contain only plain objects and arrays.`);
    }

    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map(key => [key, normalizeJsonValue((value as Record<string, unknown>)[key], `${path}.${key}`, seen)]),
    );
  } finally {
    seen.delete(value);
  }
}

export function encodeDndIdentifier(identifier: unknown, componentName: string): string {
  const normalized = normalizeJsonValue(identifier, componentName, new Set());
  if (normalized === null || Array.isArray(normalized) || typeof normalized !== "object") {
    throw new TypeError(`${componentName} requires an object identifier.`);
  }
  if (typeof normalized.type !== "string" || normalized.type.trim() === "") {
    throw new TypeError(`${componentName} requires an identifier with a non-empty string "type".`);
  }
  return `${IDENTIFIER_PREFIX}${JSON.stringify(normalized)}`;
}

export function decodeDndIdentifier<TIdentifier>(encoded: string): TIdentifier {
  if (!encoded.startsWith(IDENTIFIER_PREFIX)) throw new TypeError("Received an invalid Vireo DnD identifier.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(encoded.slice(IDENTIFIER_PREFIX.length));
  } catch {
    throw new TypeError("Received a malformed Vireo DnD identifier.");
  }

  const normalized = normalizeJsonValue(parsed, "decoded identifier", new Set());
  if (
    normalized === null ||
    Array.isArray(normalized) ||
    typeof normalized !== "object" ||
    typeof normalized.type !== "string" ||
    normalized.type.trim() === ""
  ) {
    throw new TypeError('Received a Vireo DnD identifier without a non-empty string "type".');
  }
  return normalized as TIdentifier;
}
