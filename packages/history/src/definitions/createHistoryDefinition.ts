import type {
  HistoryDefinition,
  HistoryDefinitionFields,
  HistoryDefinitionOptions,
  HistoryObjectForSchema,
} from "./historyDefinition.types";
import type { z } from "zod";

export function createHistoryDefinition<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  options: HistoryDefinitionOptions<HistoryObjectForSchema<TSchema>>,
  fields: HistoryDefinitionFields<HistoryObjectForSchema<TSchema>>,
): HistoryDefinition<HistoryObjectForSchema<TSchema>, TSchema> {
  assertDefinitionSchema(schema);
  assertNonEmptyLabel(options?.label, "History definition label");
  if (typeof options?.key !== "function") throw new TypeError("History definition key must be a function.");
  assertOptionalFunction(options.format, "History definition format");
  if (fields == null || typeof fields !== "object" || Array.isArray(fields)) {
    throw new TypeError("History definition fields must be an object.");
  }

  Object.entries(fields).forEach(([fieldName, config]) => validateFieldConfig(config, `fields.${fieldName}`));

  return { schema, options, fields };
}

function validateFieldConfig(config: unknown, location: string): void {
  if (config === false) return;
  if (config == null || typeof config !== "object" || Array.isArray(config)) {
    throw new TypeError(`History ${location} must be false or a field configuration object.`);
  }

  const record = config as Record<string, unknown>;
  switch (record.kind) {
    case "field":
      assertNonEmptyLabel(record.label, `History ${location} label`);
      assertOptionalFunction(record.format, `History ${location} format`);
      assertOptionalFunction(record.resolveChange, `History ${location} resolveChange`);
      return;
    case "array":
      assertNonEmptyLabel(record.label, `History ${location} label`);
      assertOptionalFunction(record.format, `History ${location} format`);
      if (record.mode !== undefined && record.mode !== "set" && record.mode !== "ordered") {
        throw new TypeError(`History ${location} mode must be "set" or "ordered".`);
      }
      validateFieldConfig(record.item, `${location}.item`);
      if (record.item === false) throw new TypeError(`History ${location}.item cannot be ignored.`);
      return;
    case "object":
      assertHistoryDefinition(record.definition, `History ${location} definition`);
      return;
    default:
      throw new TypeError(`History ${location} has unsupported kind "${String(record.kind)}".`);
  }
}

function assertDefinitionSchema(schema: unknown): void {
  if (schema == null || typeof schema !== "object" || typeof (schema as { parse?: unknown }).parse !== "function") {
    throw new TypeError("History definition schema must be a Zod schema.");
  }
}

function assertHistoryDefinition(value: unknown, location: string): void {
  if (value == null || typeof value !== "object") throw new TypeError(`${location} must be a history definition.`);
  const definition = value as Record<string, unknown>;
  assertDefinitionSchema(definition.schema);
  if (definition.options == null || typeof definition.options !== "object") {
    throw new TypeError(`${location} must include definition options.`);
  }
  assertNonEmptyLabel((definition.options as Record<string, unknown>).label, `${location} label`);
  if (typeof (definition.options as Record<string, unknown>).key !== "function") {
    throw new TypeError(`${location} key must be a function.`);
  }
  if (definition.fields == null || typeof definition.fields !== "object" || Array.isArray(definition.fields)) {
    throw new TypeError(`${location} fields must be an object.`);
  }
}

function assertNonEmptyLabel(value: unknown, location: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0)
    throw new TypeError(`${location} must be a non-empty string.`);
}

function assertOptionalFunction(value: unknown, location: string): void {
  if (value !== undefined && typeof value !== "function") throw new TypeError(`${location} must be a function.`);
}
