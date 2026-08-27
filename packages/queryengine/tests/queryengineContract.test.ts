import {
  createQueryEngineEntitySchemas,
  QueryEngineFieldTypeSchema,
  QueryEngineOperatorSchema,
  QueryEngineRelationModeSchema,
} from "@/models/queryengine.models";
import { describe, expect, it } from "vitest";

/**
 * Contract guard for the `@vireocodedev/query` public surface:
 * the operator/field-type/relation-mode enums are a versioned contract — this
 * fails CI on unintended removals. The `queryengine` translation namespace is
 * owned by `@vireocodedev/localization` and guarded by its own contract
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

  it("rejects empty entity identifiers and negative summary counts", () => {
    const { entitySummary } = createQueryEngineEntitySchemas();

    expect(() => entitySummary.parse({ key: "", filterableFieldCount: 0 })).toThrow();
    expect(() => entitySummary.parse({ key: "PRODUCT", filterableFieldCount: -1 })).toThrow();
  });

  it("rejects unusable field metadata", () => {
    const { fieldDefinition } = createQueryEngineEntitySchemas();
    const validField = {
      path: "name",
      label: "Name",
      type: "STRING",
      enumType: null,
      enumValues: [],
      operators: ["EQUALS"],
      relation: false,
      relationEntityKey: null,
      relationMode: "CHILD",
      multiple: false,
      relationSelectionLabelFields: [],
      expandable: false,
      maxDepth: 0,
      children: [],
    };

    expect(fieldDefinition.parse(validField)).toEqual(validField);
    expect(() => fieldDefinition.parse({ ...validField, path: "" })).toThrow();
    expect(() => fieldDefinition.parse({ ...validField, maxDepth: -1 })).toThrow();
  });
});
