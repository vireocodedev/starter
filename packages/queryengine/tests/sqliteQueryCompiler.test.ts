import {
  createSqliteQueryExecutor,
  type ParameterizedSqlitePagedQueryRequest,
  type SqliteQueryFilterAdapter,
} from "@/index";
import { describe, expect, it } from "vitest";

type CapturedRequest = ParameterizedSqlitePagedQueryRequest;
type FilterRow = {
  kind?: "leaf" | "relation";
  path: string;
  operator?: string;
  value?: string;
  parameterized?: boolean;
  selectedOptions?: Array<{ value: string; label: string }>;
};

const productAdapter: SqliteQueryFilterAdapter<number> = {
  entity: "product",
  fromClause: "product p",
  keyExpression: "p.id",
  keyAlias: "id",
  baseWhereClause: "p.deleted = 0",
  fieldAdapters: {
    description: { expression: "p.description", valueType: "string" },
    price: { expression: "p.price", valueType: "number" },
    archived: { expression: "p.archived", valueType: "boolean" },
  },
  parseKey: raw => Number(raw),
};

function filtersJson(rows: FilterRow[], entity: string | undefined = "product"): string {
  return JSON.stringify({ entity, rows: rows.map(row => ({ kind: "leaf", ...row })) });
}

type SearchOverrides = {
  queryFiltersJson?: string | null;
  page?: number;
  rowsPerPage?: number;
  sortBy?: string;
  sortDirection?: string;
  searchText?: string;
  searchExpressions?: string[];
  includeTotalCount?: boolean;
  resultRows?: unknown[][];
  totalElements?: number;
};

async function runSearch(overrides: SearchOverrides = {}) {
  const requests: CapturedRequest[] = [];
  const executor = createSqliteQueryExecutor({
    executePagedQuery: request => {
      requests.push(request);
      return Promise.resolve({
        rows: overrides.resultRows ?? [[1], [2]],
        columns: ["id"],
        totalElements: overrides.totalElements ?? 2,
      });
    },
    executeQuery: () => Promise.resolve({ columns: [], rows: [] }),
  });

  const response = await executor.pagedSearch({
    adapter: productAdapter,
    queryFiltersJson: overrides.queryFiltersJson ?? null,
    pageable: { page: overrides.page ?? 0, rowsPerPage: overrides.rowsPerPage ?? 10 },
    selectColumns: [{ alias: "id", expression: "p.id" }],
    sortBy: overrides.sortBy,
    sortDirection: overrides.sortDirection,
    defaultSortExpression: "p.id",
    sortExpressionsByKey: { description: "p.description", price: "p.price" },
    mapRow: (row, columnIndexes) => ({ id: row[columnIndexes.id] }),
    searchText: overrides.searchText,
    searchExpressions: overrides.searchExpressions,
    includeTotalCount: overrides.includeTotalCount,
  });

  return { request: requests[0], response: response as unknown as { content: Array<{ id: unknown }> } };
}

describe("SQLite query compiler", () => {
  describe("filtering", () => {
    it.each([
      ["EQUALS", { path: "price", operator: "EQUALS", value: "10" }, "p.price = ?", [10]],
      ["NOT_EQUALS", { path: "price", operator: "NOT_EQUALS", value: "10" }, "p.price <> ?", [10]],
      ["GREATER_THAN", { path: "price", operator: "GREATER_THAN", value: "10" }, "p.price > ?", [10]],
      ["GREATER_OR_EQUAL", { path: "price", operator: "GREATER_OR_EQUAL", value: "10" }, "p.price >= ?", [10]],
      ["LESS_THAN", { path: "price", operator: "LESS_THAN", value: "10" }, "p.price < ?", [10]],
      ["LESS_OR_EQUAL", { path: "price", operator: "LESS_OR_EQUAL", value: "10" }, "p.price <= ?", [10]],
      [
        "CONTAINS",
        { path: "description", operator: "CONTAINS", value: "Leather" },
        "LOWER(COALESCE(CAST(p.description AS TEXT), '')) LIKE ?",
        ["%leather%"],
      ],
      [
        "STARTS_WITH",
        { path: "description", operator: "STARTS_WITH", value: "Leather" },
        "LOWER(COALESCE(CAST(p.description AS TEXT), '')) LIKE ?",
        ["leather%"],
      ],
      [
        "ENDS_WITH",
        { path: "description", operator: "ENDS_WITH", value: "Leather" },
        "LOWER(COALESCE(CAST(p.description AS TEXT), '')) LIKE ?",
        ["%leather"],
      ],
      ["IN", { path: "price", operator: "IN", value: "1, 2 ,3" }, "p.price IN (?, ?, ?)", [1, 2, 3]],
      ["IS_NULL", { path: "description", operator: "IS_NULL" }, "p.description IS NULL", []],
      ["IS_NOT_NULL", { path: "description", operator: "IS_NOT_NULL" }, "p.description IS NOT NULL", []],
      [
        "DATE_RANGE",
        { path: "price", operator: "DATE_RANGE", value: "1|5" },
        "(p.price >= ? AND p.price <= ?)",
        [1, 5],
      ],
    ])("translates %s into parameterized SQL", async (_name, row, expected, expectedParams) => {
      const { request } = await runSearch({ queryFiltersJson: filtersJson([row as FilterRow]) });
      expect(request.whereSql).toContain(expected);
      expect(request.whereParams).toEqual(expectedParams);
    });

    it("keeps the base where clause ahead of every filter", async () => {
      const { request } = await runSearch({
        queryFiltersJson: filtersJson([{ path: "price", operator: "EQUALS", value: "10" }]),
      });
      expect(request.whereSql).toBe("p.deleted = 0 AND p.price = ?");
      expect(request.whereParams).toEqual([10]);
    });

    it("combines multiple filters with AND", async () => {
      const { request } = await runSearch({
        queryFiltersJson: filtersJson([
          { path: "price", operator: "GREATER_THAN", value: "5" },
          { path: "description", operator: "CONTAINS", value: "belt" },
        ]),
      });
      expect(request.whereSql).toBe(
        "p.deleted = 0 AND p.price > ? AND LOWER(COALESCE(CAST(p.description AS TEXT), '')) LIKE ?",
      );
      expect(request.whereParams).toEqual([5, "%belt%"]);
    });

    it("binds hostile string input without placing it in SQL", async () => {
      const hostile = "O'Brien'; DROP TABLE product; --";
      const { request } = await runSearch({
        queryFiltersJson: filtersJson([{ path: "description", operator: "EQUALS", value: hostile }]),
      });
      expect(request.whereSql).toBe("p.deleted = 0 AND p.description = ?");
      expect(request.whereSql).not.toContain(hostile);
      expect(request.whereParams).toEqual([hostile]);
    });

    it("renders boolean filter values as 1 and 0", async () => {
      const truthy = await runSearch({
        queryFiltersJson: filtersJson([{ path: "archived", operator: "EQUALS", value: "true" }]),
      });
      const falsy = await runSearch({
        queryFiltersJson: filtersJson([{ path: "archived", operator: "EQUALS", value: "false" }]),
      });
      expect(truthy.request.whereParams).toEqual([1]);
      expect(falsy.request.whereParams).toEqual([0]);
    });

    it("rejects non-numeric values for numeric fields", async () => {
      await expect(
        runSearch({
          queryFiltersJson: filtersJson([{ path: "price", operator: "EQUALS", value: "not-a-number" }]),
        }),
      ).rejects.toThrow("Invalid numeric filter value: not-a-number");
    });

    it("rejects filters addressed to a different entity", async () => {
      await expect(
        runSearch({
          queryFiltersJson: filtersJson([{ path: "price", operator: "EQUALS", value: "1" }], "invoice"),
        }),
      ).rejects.toThrow("Invalid filter entity. Expected: product");
    });

    it.each([
      ["a parameterized row", [{ path: "price", operator: "EQUALS", value: "1", parameterized: true }]],
      ["an operator with no value", [{ path: "price", operator: "EQUALS", value: "  " }]],
      ["an empty IN list", [{ path: "price", operator: "IN", value: " , " }]],
      ["a DATE_RANGE with no bounds", [{ path: "price", operator: "DATE_RANGE", value: "|" }]],
    ])("ignores %s", async (_name, rows) => {
      const { request } = await runSearch({ queryFiltersJson: filtersJson(rows as FilterRow[]) });
      expect(request.whereSql).toBe("p.deleted = 0");
      expect(request.whereParams).toEqual([]);
    });

    it("rejects malformed filter JSON instead of silently broadening the query", async () => {
      await expect(runSearch({ queryFiltersJson: "{not json" })).rejects.toThrow("Query filter JSON is invalid.");
    });

    it("rejects unknown filter fields instead of silently broadening the query", async () => {
      await expect(
        runSearch({
          queryFiltersJson: filtersJson([{ path: "unknown", operator: "EQUALS", value: "1" }]),
        }),
      ).rejects.toThrow("Unknown SQLite filter field: unknown");
    });

    it("rejects invalid boolean values", async () => {
      await expect(
        runSearch({
          queryFiltersJson: filtersJson([{ path: "archived", operator: "EQUALS", value: "yes" }]),
        }),
      ).rejects.toThrow("Invalid boolean filter value: yes");
    });

    it("builds relation IN clauses from selected options", async () => {
      const { request } = await runSearch({
        queryFiltersJson: JSON.stringify({
          entity: "product",
          rows: [
            {
              kind: "relation",
              path: "price",
              selectedOptions: [
                { value: "1", label: "One" },
                { value: "2", label: "Two" },
              ],
            },
          ],
        }),
      });
      expect(request.whereSql).toContain("p.price IN (?, ?)");
      expect(request.whereParams).toEqual([1, 2]);
    });
  });

  describe("sorting", () => {
    it("uses the default expression when no sort key is given", async () => {
      expect((await runSearch()).request.orderBySql).toBe("p.id ASC");
    });

    it("resolves known sort keys", async () => {
      const { request } = await runSearch({ sortBy: "description", sortDirection: "desc" });
      expect(request.orderBySql).toBe("p.description DESC");
    });

    it("falls back for unknown sort keys", async () => {
      expect((await runSearch({ sortBy: "nope" })).request.orderBySql).toBe("p.id ASC");
    });

    it("treats directions other than exact 'desc' as ascending", async () => {
      expect((await runSearch({ sortBy: "price", sortDirection: "DESC" })).request.orderBySql).toBe("p.price ASC");
      expect((await runSearch({ sortBy: "price", sortDirection: "sideways" })).request.orderBySql).toBe("p.price ASC");
    });
  });

  describe("pagination", () => {
    it("converts page and rowsPerPage into limit and offset", async () => {
      const { request } = await runSearch({ page: 2, rowsPerPage: 25 });
      expect(request.limit).toBe(25);
      expect(request.offset).toBe(50);
    });

    it("omits limit and offset when rowsPerPage is not positive", async () => {
      const { request } = await runSearch({ rowsPerPage: 0 });
      expect(request.limit).toBeNull();
      expect(request.offset).toBeNull();
    });

    it("clamps negative pages to the first page", async () => {
      expect((await runSearch({ page: -5, rowsPerPage: 10 })).request.offset).toBe(0);
    });

    it("requests one probe row when the total count is skipped", async () => {
      const { request } = await runSearch({ rowsPerPage: 10, includeTotalCount: false });
      expect(request.includeTotalCount).toBe(false);
      expect(request.limit).toBe(11);
    });

    it("trims the probe row from the returned page", async () => {
      const { response } = await runSearch({
        rowsPerPage: 2,
        includeTotalCount: false,
        resultRows: [[1], [2], [3]],
      });
      expect(response.content).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe("free-text search", () => {
    it("matches lowercased text against every search expression", async () => {
      const { request } = await runSearch({
        searchText: "  LeAtHeR  ",
        searchExpressions: ["p.description", "p.keywords"],
      });
      expect(request.whereSql).toBe(
        "p.deleted = 0 AND (LOWER(COALESCE(CAST(p.description AS TEXT), '')) LIKE ?" +
          " OR LOWER(COALESCE(CAST(p.keywords AS TEXT), '')) LIKE ?)",
      );
      expect(request.whereParams).toEqual(["%leather%", "%leather%"]);
    });

    it.each([
      ["blank search text", { searchText: "   ", searchExpressions: ["p.description"] }],
      ["no search expressions", { searchText: "leather", searchExpressions: [] }],
    ])("adds no clause for %s", async (_name, overrides) => {
      expect((await runSearch(overrides)).request.whereSql).toBe("p.deleted = 0");
    });

    it("binds quotes in search text", async () => {
      const { request } = await runSearch({ searchText: "o'brien", searchExpressions: ["p.description"] });
      expect(request.whereSql).toContain("LIKE ?");
      expect(request.whereParams).toEqual(["%o'brien%"]);
    });
  });
});
