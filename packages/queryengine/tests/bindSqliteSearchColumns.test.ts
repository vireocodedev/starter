import { bindSqliteSearchColumns } from "@/index";
import { describe, expect, it } from "vitest";

describe("bindSqliteSearchColumns", () => {
  const columns = bindSqliteSearchColumns([
    { alias: "id", expression: "p.id", valueType: "number" },
    { alias: "description", expression: "p.description", valueType: "string" },
  ]);

  it("keys filter adapters by alias and keeps table expressions", () => {
    expect(columns.fieldAdapters).toEqual({
      id: { expression: "p.id", valueType: "number" },
      description: { expression: "p.description", valueType: "string" },
    });
  });

  it("projects select columns in declaration order", () => {
    expect(columns.selectColumns).toEqual([
      { alias: "id", expression: "p.id" },
      { alias: "description", expression: "p.description" },
    ]);
  });

  it("sorts by select aliases rather than table expressions", () => {
    expect(columns.sortExpressionsByKey).toEqual({ id: "id", description: "description" });
  });

  describe("per-column overrides", () => {
    const buyerColumns = bindSqliteSearchColumns(
      [
        { alias: "id", expression: "b.id", valueType: "number", filterAs: false, sortAs: false },
        { alias: "name", expression: "b.name", valueType: "string" },
        {
          alias: "countryCode",
          expression: "b.country_code",
          valueType: "string",
          filterAs: "country",
          sortAs: "countryNameEnglish",
        },
      ],
      { "country.tax": { expression: "c.tax", valueType: "number" } },
    );

    it("still selects columns that are neither filterable nor sortable", () => {
      expect(buyerColumns.selectColumns).toContainEqual({ alias: "id", expression: "b.id" });
      expect(buyerColumns.fieldAdapters).not.toHaveProperty("id");
      expect(buyerColumns.sortExpressionsByKey).not.toHaveProperty("id");
    });

    it("exposes columns under their filterAs names", () => {
      expect(buyerColumns.fieldAdapters.country).toEqual({ expression: "b.country_code", valueType: "string" });
      expect(buyerColumns.fieldAdapters).not.toHaveProperty("countryCode");
    });

    it("sorts by sortAs expressions while keeping aliases as sort keys", () => {
      expect(buyerColumns.sortExpressionsByKey).toEqual({ name: "name", countryCode: "countryNameEnglish" });
    });

    it("merges filter-only relation fields", () => {
      expect(buyerColumns.fieldAdapters["country.tax"]).toEqual({ expression: "c.tax", valueType: "number" });
      expect(buyerColumns.selectColumns).not.toContainEqual(expect.objectContaining({ alias: "country.tax" }));
    });
  });

  it("rejects duplicate aliases and filter bindings", () => {
    expect(() =>
      bindSqliteSearchColumns([
        { alias: "id", expression: "p.id", valueType: "number" },
        { alias: "id", expression: "p.parent_id", valueType: "number" },
      ]),
    ).toThrow('SQLite search column alias "id" is registered more than once.');

    expect(() =>
      bindSqliteSearchColumns([{ alias: "country", expression: "p.country", valueType: "string" }], {
        country: { expression: "c.code", valueType: "string" },
      }),
    ).toThrow('SQLite filter field "country" is registered more than once.');
  });
});
