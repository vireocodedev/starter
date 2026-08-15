import {
  createSqliteQueryExecutor,
  executeParameterizedSqlitePagedQuery,
  executeParameterizedSqliteQuery,
  type QueryExecutorSqliteStatement,
  type SqliteQueryFilterAdapter,
} from "@/index";
import { describe, expect, it, vi } from "vitest";

function createStatement(rows: unknown[][], columns: string[] = ["id"]) {
  let index = 0;
  return {
    bind: vi.fn(),
    step: vi.fn(() => index < rows.length),
    get: vi.fn(() => rows[index++]),
    getColumnNames: vi.fn(() => columns),
    finalize: vi.fn(),
  } satisfies QueryExecutorSqliteStatement;
}

describe("parameterized SQLite query execution", () => {
  it("binds the same filter values to the page and count statements", () => {
    const page = createStatement([[7]]);
    const count = createStatement([[12]], ["total_elements"]);
    const db = { prepare: vi.fn().mockReturnValueOnce(page).mockReturnValueOnce(count) };

    const result = executeParameterizedSqlitePagedQuery(
      db,
      {
        selectSql: "p.id AS id",
        fromSql: "product p",
        whereSql: "p.description = ? AND p.price > ?",
        whereParams: ["O'Brien", 5],
        orderBySql: "id ASC",
        limit: 10,
        offset: 20,
        includeTotalCount: true,
      },
      () => 100,
    );

    expect(db.prepare.mock.calls[0][0]).toContain("LIMIT 10 OFFSET 20");
    expect(page.bind).toHaveBeenCalledWith(["O'Brien", 5]);
    expect(count.bind).toHaveBeenCalledWith(["O'Brien", 5]);
    expect(result).toMatchObject({ rows: [[7]], totalElements: 12 });
    expect(page.finalize).toHaveBeenCalledOnce();
    expect(count.finalize).toHaveBeenCalledOnce();
  });

  it("binds matching-key values without passing them through a script parser", () => {
    const statement = createStatement([[3], [8]]);
    const db = { prepare: vi.fn(() => statement) };

    expect(executeParameterizedSqliteQuery(db, { sql: "SELECT id WHERE name = ?", params: ["A; B"] })).toEqual({
      columns: ["id"],
      rows: [[3], [8]],
    });
    expect(statement.bind).toHaveBeenCalledWith(["A; B"]);
  });
});

describe("createSqliteQueryExecutor", () => {
  const adapter: SqliteQueryFilterAdapter<number> = {
    entity: "product",
    fromClause: "product p",
    keyExpression: "p.id",
    keyAlias: "id",
    fieldAdapters: { description: { expression: "p.description", valueType: "string" } },
    parseKey: Number,
  };

  it("finds matching keys through a parameterized query port", async () => {
    const executeQuery = vi.fn().mockResolvedValue({ columns: ["id"], rows: [[1], [2]] });
    const executor = createSqliteQueryExecutor({ executeQuery, executePagedQuery: vi.fn() });

    await expect(
      executor.findMatchingKeys(
        adapter,
        JSON.stringify({
          entity: "product",
          rows: [{ kind: "leaf", path: "description", operator: "EQUALS", value: "O'Brien" }],
        }),
      ),
    ).resolves.toEqual(new Set([1, 2]));
    expect(executeQuery).toHaveBeenCalledWith(
      expect.objectContaining({ sql: expect.stringContaining("p.description = ?"), params: ["O'Brien"] }),
    );
  });

  it("deduplicates identical concurrent page requests", async () => {
    let resolveQuery!: (value: { columns: string[]; rows: unknown[][]; totalElements: number }) => void;
    const pending = new Promise<{ columns: string[]; rows: unknown[][]; totalElements: number }>(resolve => {
      resolveQuery = resolve;
    });
    const executePagedQuery = vi.fn(() => pending);
    const executor = createSqliteQueryExecutor({ executePagedQuery, executeQuery: vi.fn(), now: () => 10 });
    const args = {
      adapter,
      queryFiltersJson: null,
      pageable: { page: 0, rowsPerPage: 10 },
      selectColumns: [{ alias: "id", expression: "p.id" }],
      sortBy: undefined,
      sortDirection: undefined,
      defaultSortExpression: "id",
      sortExpressionsByKey: {},
      mapRow: (row: unknown[]) => Number(row[0]),
    };

    const first = executor.pagedSearch(args);
    const second = executor.pagedSearch(args);
    expect(executePagedQuery).toHaveBeenCalledOnce();
    resolveQuery({ columns: ["id"], rows: [[1]], totalElements: 1 });
    await expect(Promise.all([first, second])).resolves.toEqual([
      expect.objectContaining({ content: [1] }),
      expect.objectContaining({ content: [1] }),
    ]);
  });
});
