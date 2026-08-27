import {
  createSqliteQueryExecutor,
  type ParameterizedSqlitePagedQueryRequest,
  type SqliteQueryFilterAdapter,
} from "@vireocodedev/query";

const adapter: SqliteQueryFilterAdapter<number> = {
  entity: "customer",
  fromClause: "customer",
  keyExpression: "customer.id",
  keyAlias: "id",
  fieldAdapters: { active: { expression: "customer.active", valueType: "boolean" } },
  parseKey: Number,
};

export async function runSqliteExecutionExample() {
  let compiledRequest: ParameterizedSqlitePagedQueryRequest | undefined;
  const executor = createSqliteQueryExecutor({
    executePagedQuery: request => {
      compiledRequest = request;
      return Promise.resolve({ columns: ["id", "name"], rows: [[7, "Northstar"]], totalElements: 1 });
    },
    executeQuery: () => Promise.resolve({ columns: [], rows: [] }),
  });

  const page = await executor.pagedSearch({
    adapter,
    queryFiltersJson: JSON.stringify({
      entity: "customer",
      rows: [{ kind: "leaf", path: "active", operator: "EQUALS", value: "true" }],
    }),
    pageable: { page: 0, rowsPerPage: 20 },
    selectColumns: [
      { alias: "id", expression: "customer.id" },
      { alias: "name", expression: "customer.name" },
    ],
    sortBy: "name",
    sortDirection: "desc",
    defaultSortExpression: "customer.id",
    sortExpressionsByKey: { name: "customer.name" },
    mapRow: (row, indexes) => ({ id: row[indexes.id], name: row[indexes.name] }),
  });

  return { compiledRequest, page };
}
