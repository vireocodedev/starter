import {
  createQueryEngineEntitySchemas,
  QueryEngineFieldTypeSchema,
  QueryEngineOperatorSchema,
  QueryEngineRelationModeSchema,
} from "@/models/queryengine.models";
import { describe, expect, it } from "vitest";

/**
 * Contract guard for the `@vireocodedev/starter-queryengine` public surface:
 * the operator/field-type/relation-mode enums are a versioned contract — this
 * fails CI on unintended removals. The `queryengine` translation namespace is
 * owned by `@vireocodedev/starter-localization` and guarded by its own contract
 * test.
 */
describe("queryengine contract", () => {
  it("keeps the operator set stable", () => {
    expect(QueryEngineOperatorSchema.options).toEqual([
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
    ]);
  });

  it("keeps the field-type and relation-mode sets stable", () => {
    expect(QueryEngineFieldTypeSchema.options).toEqual(["STRING", "NUMBER", "BOOLEAN", "DATE", "ENUM", "RELATION"]);
    expect(QueryEngineRelationModeSchema.options).toEqual(["CHILD", "SELECTION", "BOTH"]);
  });

  it("builds parse schemas from the (default) entity-key schema", () => {
    const schemas = createQueryEngineEntitySchemas();
    expect(typeof schemas.entityDefinition.parse).toBe("function");
    expect(typeof schemas.entitySummary.parse).toBe("function");
    expect(typeof schemas.fieldDefinition.parse).toBe("function");
  });
});
