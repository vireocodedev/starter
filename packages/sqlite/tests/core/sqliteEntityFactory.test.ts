import { createSqliteEntityBundle } from "@/core/sqliteEntityFactory";
import { describe, expect, it } from "vitest";

const stringField = (column: string, id = false) => ({
  column,
  id,
  fromDb: (value: unknown) => String(value),
});

function createValidSpec() {
  return {
    entityNameSingular: "Customer",
    entityNamePlural: "Customers",
    tableName: "customers",
    fields: {
      id: stringField("customer_id", true),
      name: stringField("name"),
    },
    requestKeys: {
      replace: "customers",
      upsert: "customer",
      delete: "customerIds",
    },
  } as const;
}

describe("createSqliteEntityBundle", () => {
  it("derives stable operation names from a valid entity specification", () => {
    const bundle = createSqliteEntityBundle(createValidSpec());

    expect(bundle.operationNames).toEqual({
      replace: "replaceCustomers",
      upsert: "upsertCustomer",
      list: "listCustomers",
      delete: "deleteCustomers",
    });
    expect(Object.keys(bundle.requestHandlers)).toEqual([
      "replaceCustomers",
      "upsertCustomer",
      "listCustomers",
      "deleteCustomers",
    ]);
  });

  it("requires exactly one identifier field", () => {
    const spec = createValidSpec();
    expect(() =>
      createSqliteEntityBundle({
        ...spec,
        fields: { id: stringField("customer_id"), name: stringField("name") },
      }),
    ).toThrow("must define exactly one field with id: true");
  });

  it("rejects ambiguous and runtime-owned column mappings", () => {
    const spec = createValidSpec();
    expect(() =>
      createSqliteEntityBundle({
        ...spec,
        fields: { id: stringField("customer_id", true), name: stringField("customer_id") },
      }),
    ).toThrow("maps more than one field to the same column");

    expect(() =>
      createSqliteEntityBundle({
        ...spec,
        fields: { id: stringField("customer_id", true), keywords: stringField("keywords") },
      }),
    ).toThrow('maps field column "keywords", which is managed by the entity runtime');
  });

  it("rejects empty names before generating SQL or protocol operations", () => {
    expect(() => createSqliteEntityBundle({ ...createValidSpec(), tableName: " " })).toThrow(
      "tableName must be a non-empty string.",
    );
    expect(() =>
      createSqliteEntityBundle({
        ...createValidSpec(),
        requestKeys: { replace: "", upsert: "customer", delete: "customerIds" },
      }),
    ).toThrow("requestKeys.replace must be a non-empty string.");
  });
});
