import z from "zod";

/**
 * Entity keys are opaque strings at the library level. The consuming app owns
 * its entity-key set and injects a validating/normalizing schema via
 * {@link createQueryEngineEntitySchemas} (see createQueryEngineApi options).
 */
export type QueryEngineEntityKey = string;

const QueryEngineOperators = [
  "EQUALS",
  "NOT_EQUALS",
  "CONTAINS",
  "STARTS_WITH",
  "ENDS_WITH",
  "IN",
  "GREATER_THAN",
  "GREATER_OR_EQUAL",
  "LESS_THAN",
  "LESS_OR_EQUAL",
  "DATE_RANGE",
  "IS_NULL",
  "IS_NOT_NULL",
] as const;

const QueryEngineFieldTypes = ["STRING", "NUMBER", "BOOLEAN", "DATE", "ENUM", "RELATION"] as const;
const QueryEngineRelationModes = ["CHILD", "SELECTION", "BOTH"] as const;

export const QueryEngineOperatorSchema = z.enum(QueryEngineOperators);
export type QueryEngineOperator = z.infer<typeof QueryEngineOperatorSchema>;

export const QueryEngineFieldTypeSchema = z.enum(QueryEngineFieldTypes);
export type QueryEngineFieldType = z.infer<typeof QueryEngineFieldTypeSchema>;

export const QueryEngineRelationModeSchema = z.enum(QueryEngineRelationModes);
export type QueryEngineRelationMode = z.infer<typeof QueryEngineRelationModeSchema>;

export interface QueryEngineRelationOption {
  value: string;
  label: string;
}

export const QueryEngineRelationOptionSchema: z.ZodType<QueryEngineRelationOption> = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

export interface QueryEngineFieldDefinition {
  path: string;
  label: string;
  type: QueryEngineFieldType;
  enumType: string | null;
  enumValues: string[];
  operators: QueryEngineOperator[];
  relation: boolean;
  relationEntityKey: QueryEngineEntityKey | null;
  relationMode: QueryEngineRelationMode;
  multiple: boolean;
  relationSelectionLabelFields: string[];
  expandable: boolean;
  maxDepth: number;
  children: QueryEngineFieldDefinition[];
}

/**
 * The published shape of an entity. Backends are free to send more — the parse
 * schemas pass unknown keys through untouched, so a consumer can widen this type
 * with its own backend-specific fields:
 *
 * ```ts
 * type AppEntityDefinition = QueryEngineEntityDefinition & { javaType: string };
 * ```
 */
export interface QueryEngineEntityDefinition {
  key: QueryEngineEntityKey;
  title: string;
  fields: QueryEngineFieldDefinition[];
}

export interface QueryEngineEntitySummary {
  key: QueryEngineEntityKey;
  filterableFieldCount: number;
}

export interface QueryEngineRelationFieldOptionsRequest {
  entityKey: QueryEngineEntityKey;
  fieldPath: string;
  searchText?: string;
}

export type QueryEngineEntitySchemas = {
  fieldDefinition: z.ZodType<QueryEngineFieldDefinition, z.ZodTypeDef, unknown>;
  entityDefinition: z.ZodType<QueryEngineEntityDefinition, z.ZodTypeDef, unknown>;
  entitySummary: z.ZodType<QueryEngineEntitySummary, z.ZodTypeDef, unknown>;
};

/**
 * Builds the entity-key-dependent parse schemas. Pass a consumer-owned
 * `entityKeySchema` (e.g. an enum with legacy normalization) to validate keys;
 * defaults to a non-empty string schema so the engine stays generic over any
 * key set while still rejecting unusable identifiers.
 */
export function createQueryEngineEntitySchemas(
  entityKeySchema: z.ZodType<QueryEngineEntityKey, z.ZodTypeDef, unknown> = z.string().min(1),
): QueryEngineEntitySchemas {
  const fieldDefinition: z.ZodType<QueryEngineFieldDefinition, z.ZodTypeDef, unknown> = z.lazy(() =>
    z.object({
      path: z.string().min(1),
      label: z.string().min(1),
      type: QueryEngineFieldTypeSchema,
      enumType: z.string().nullable(),
      enumValues: z.array(z.string()),
      operators: z.array(QueryEngineOperatorSchema),
      relation: z.boolean(),
      relationEntityKey: entityKeySchema.nullable(),
      relationMode: QueryEngineRelationModeSchema,
      multiple: z.boolean(),
      relationSelectionLabelFields: z.array(z.string()),
      expandable: z.boolean(),
      maxDepth: z.number().int().nonnegative(),
      children: z.array(fieldDefinition),
    }),
  );

  const entityDefinition: z.ZodType<QueryEngineEntityDefinition, z.ZodTypeDef, unknown> = z
    .object({
      key: entityKeySchema,
      title: z.string().min(1),
      fields: z.array(fieldDefinition),
    })
    .passthrough();

  const entitySummary: z.ZodType<QueryEngineEntitySummary, z.ZodTypeDef, unknown> = z
    .object({
      key: entityKeySchema,
      filterableFieldCount: z.number().int().nonnegative(),
    })
    .passthrough();

  return { fieldDefinition, entityDefinition, entitySummary };
}
