import QUERYENGINE_EN from "@/localization/queryengine.en";
import QUERYENGINE_HR from "@/localization/queryengine.hr";
import {
  createQueryEngineEntitySchemas,
  QueryEngineFieldTypeSchema,
  QueryEngineOperatorSchema,
  QueryEngineRelationModeSchema,
} from "@/models/queryengine.models";
import { describe, expect, it } from "vitest";

type JsonRecord = Record<string, unknown>;

function flattenKeys(obj: JsonRecord, prefix = ""): string[] {
  return Object.entries(obj)
    .flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return value !== null && typeof value === "object" && !Array.isArray(value)
        ? flattenKeys(value as JsonRecord, path)
        : [path];
    })
    .sort();
}

/**
 * Contract guard for the `@vireocodedev/starter-queryengine` public surface:
 * the operator/field-type/relation-mode enums and the localization key set are
 * a versioned contract — this fails CI on unintended removals.
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

  it("ships every base locale with the canonical (en) localization shape", () => {
    expect(flattenKeys(QUERYENGINE_HR as JsonRecord)).toEqual(flattenKeys(QUERYENGINE_EN as JsonRecord));
  });

  it("keeps the localization key surface stable (update the snapshot only for intended changes)", () => {
    expect(flattenKeys(QUERYENGINE_EN as JsonRecord)).toMatchSnapshot();
  });
});
