import {
  compileQueryFilterWhere,
  compileSearchTextWhere,
  type SqliteQueryFilterAdapter,
  type SqliteSearchSelectColumn,
} from "@/sqlite/compileQueryFilterWhere";

export type SqlitePageableParams = {
  page: number;
  rowsPerPage: number;
  sortBy?: string;
  sortDirection?: string;
};

export type SqlitePageableResponse<TRow> = {
  content: TRow[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type ParameterizedSqlitePagedQueryRequest = {
  selectSql: string;
  fromSql: string;
  whereSql: string;
  whereParams: unknown[];
  orderBySql: string;
  limit: number | null;
  offset: number | null;
  includeTotalCount: boolean;
  clientSentAtMs?: number;
};

export type ParameterizedSqliteQueryRequest = { sql: string; params: unknown[] };
export type ParameterizedSqliteQueryResult = { columns: string[]; rows: unknown[][] };
export type ParameterizedSqlitePagedQueryResult = ParameterizedSqliteQueryResult & {
  totalElements: number | null;
  queueWaitMs?: number;
  workerExecMs?: number;
};

export type SqlitePagedSearchArgs<TKey extends string | number, TEntityKey extends string, TRow> = {
  adapter: SqliteQueryFilterAdapter<TKey, TEntityKey>;
  queryFiltersJson: string | null;
  pageable: SqlitePageableParams;
  selectColumns: SqliteSearchSelectColumn[];
  sortBy: string | undefined;
  sortDirection: string | undefined;
  defaultSortExpression: string;
  sortExpressionsByKey: Record<string, string>;
  mapRow: (row: unknown[], columnIndexes: Record<string, number>) => TRow;
  searchText?: string;
  searchExpressions?: string[];
  includeTotalCount?: boolean;
};

export type CreateSqliteQueryExecutorConfig = {
  executePagedQuery: (request: ParameterizedSqlitePagedQueryRequest) => Promise<ParameterizedSqlitePagedQueryResult>;
  executeQuery: (request: ParameterizedSqliteQueryRequest) => Promise<ParameterizedSqliteQueryResult>;
  now?: () => number;
  log?: (message: string, details: Record<string, unknown>) => void;
};

export type SqliteQueryExecutor = {
  pagedSearch: <TKey extends string | number, TEntityKey extends string, TRow>(
    args: SqlitePagedSearchArgs<TKey, TEntityKey, TRow>,
  ) => Promise<SqlitePageableResponse<TRow>>;
  findMatchingKeys: <TKey extends string | number, TEntityKey extends string>(
    adapter: SqliteQueryFilterAdapter<TKey, TEntityKey>,
    queryFiltersJson: string | null,
  ) => Promise<Set<TKey> | null>;
};

export type QueryExecutorSqliteStatement = {
  bind: (values: readonly unknown[]) => unknown;
  step: () => boolean;
  get: (target: unknown[]) => unknown[];
  getColumnNames?: (target?: string[]) => string[];
  finalize: () => unknown;
};

export type QueryExecutorSqliteDatabase = { prepare: (sql: string) => QueryExecutorSqliteStatement };

function defaultNow(): number {
  return typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
}

function stableStringify(value: unknown): string {
  if (value == null || typeof value !== "object") return JSON.stringify(value) ?? String(value);
  if (Array.isArray(value)) return `[${value.map(item => stableStringify(item)).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`;
}

function toColumnIndexes(columns: string[]): Record<string, number> {
  return Object.fromEntries(columns.map((column, index) => [column, index]));
}

function normalizePage(pageable: SqlitePageableParams): number {
  return Number.isFinite(pageable.page) ? Math.max(0, Number(pageable.page)) : 0;
}

function normalizeRowsPerPage(pageable: SqlitePageableParams): number {
  return Number.isFinite(pageable.rowsPerPage) ? Number(pageable.rowsPerPage) : -1;
}

function normalizePagination(pageable: SqlitePageableParams): { limit: number | null; offset: number | null } {
  const page = normalizePage(pageable);
  const rowsPerPage = normalizeRowsPerPage(pageable);
  return rowsPerPage <= 0 ? { limit: null, offset: null } : { limit: rowsPerPage, offset: page * rowsPerPage };
}

function getSortExpression(
  sortBy: string | undefined,
  defaultSortExpression: string,
  sortExpressionsByKey: Record<string, string>,
): string {
  return sortBy ? (sortExpressionsByKey[sortBy] ?? defaultSortExpression) : defaultSortExpression;
}

export function createSqliteQueryExecutor(config: CreateSqliteQueryExecutorConfig): SqliteQueryExecutor {
  const now = config.now ?? defaultNow;
  const inFlightPagedQueries = new Map<string, Promise<ParameterizedSqlitePagedQueryResult>>();

  const executePagedQuery = async (
    request: ParameterizedSqlitePagedQueryRequest,
  ): Promise<ParameterizedSqlitePagedQueryResult> => {
    const key = stableStringify(request);
    const timedRequest = { ...request, clientSentAtMs: now() };
    const existing = inFlightPagedQueries.get(key);
    if (existing) return await existing;
    const promise = config.executePagedQuery(timedRequest);
    inFlightPagedQueries.set(key, promise);
    try {
      return await promise;
    } finally {
      inFlightPagedQueries.delete(key);
    }
  };

  return {
    async pagedSearch(args) {
      const totalStartedAt = now();
      const page = normalizePage(args.pageable);
      const rowsPerPage = normalizeRowsPerPage(args.pageable);
      const compiledFilter = compileQueryFilterWhere(args.adapter, args.queryFiltersJson);
      const compiledSearch = compileSearchTextWhere(args.searchText, args.searchExpressions);
      const whereSql = [compiledFilter.sql, compiledSearch?.sql].filter(Boolean).join(" AND ");
      const whereParams = [...compiledFilter.params, ...(compiledSearch?.params ?? [])];
      const selectSql = args.selectColumns.map(column => `${column.expression} AS ${column.alias}`).join(", ");
      const sortExpression = getSortExpression(args.sortBy, args.defaultSortExpression, args.sortExpressionsByKey);
      const sortDirection = args.sortDirection === "desc" ? "DESC" : "ASC";
      const { limit, offset } = normalizePagination(args.pageable);
      const includeTotalCount = args.includeTotalCount ?? true;
      const effectiveLimit = !includeTotalCount && limit != null && limit > 0 ? limit + 1 : limit;
      const sqlStartedAt = now();
      const result = await executePagedQuery({
        selectSql,
        fromSql: args.adapter.fromClause,
        whereSql,
        whereParams,
        orderBySql: `${sortExpression} ${sortDirection}`,
        limit: effectiveLimit,
        offset,
        includeTotalCount,
      });
      const sqlExecMs = Math.round(now() - sqlStartedAt);
      let rows = result.rows;
      let hasNextPage = false;
      if (!includeTotalCount && limit != null && limit > 0 && rows.length > limit) {
        rows = rows.slice(0, limit);
        hasNextPage = true;
      }

      const mapStartedAt = now();
      const indexes = toColumnIndexes(result.columns);
      const content = rows.map(row => args.mapRow(row, indexes));
      const totalElements = includeTotalCount
        ? (result.totalElements ?? 0)
        : rowsPerPage > 0
          ? page * rowsPerPage + content.length + (hasNextPage ? 1 : 0)
          : content.length;
      const response = {
        content,
        number: page,
        size: rowsPerPage > 0 ? rowsPerPage : content.length,
        totalElements,
        totalPages: rowsPerPage > 0 ? Math.ceil(totalElements / rowsPerPage) : 0,
      };

      config.log?.("paged search done", {
        entity: args.adapter.entity,
        totalMs: Math.round(now() - totalStartedAt),
        sqlExecMs,
        queueWaitMs: result.queueWaitMs ?? null,
        workerExecMs: result.workerExecMs ?? null,
        mapRowsMs: Math.round(now() - mapStartedAt),
        rows: content.length,
        totalElements,
        includeTotalCount,
        hasNextPage,
        whereClauses: 1 + compiledFilter.filterCount + (compiledSearch ? 1 : 0),
        searchTextLength: args.searchText?.trim().length ?? 0,
        sortBy: args.sortBy ?? null,
        sortDirection: args.sortDirection ?? "asc",
        page,
        rowsPerPage,
      });
      return response;
    },

    async findMatchingKeys(adapter, queryFiltersJson) {
      const compiled = compileQueryFilterWhere(adapter, queryFiltersJson);
      if (compiled.filterCount === 0) return null;
      const result = await config.executeQuery({
        sql: `
          SELECT DISTINCT ${adapter.keyExpression} AS ${adapter.keyAlias}
          FROM ${adapter.fromClause}
          WHERE ${compiled.sql};
        `,
        params: compiled.params,
      });
      const keyIndex = result.columns.indexOf(adapter.keyAlias);
      if (keyIndex < 0) return new Set();
      return new Set(result.rows.map(row => adapter.parseKey(row[keyIndex])));
    },
  };
}

function readRows(statement: QueryExecutorSqliteStatement): ParameterizedSqliteQueryResult {
  const columns = statement.getColumnNames?.([]) ?? [];
  const rows: unknown[][] = [];
  while (statement.step()) rows.push(statement.get([]));
  return { columns, rows };
}

function runBoundQuery(
  db: QueryExecutorSqliteDatabase,
  sql: string,
  params: readonly unknown[],
): ParameterizedSqliteQueryResult {
  const statement = db.prepare(sql);
  try {
    statement.bind(params);
    return readRows(statement);
  } finally {
    statement.finalize();
  }
}

export function executeParameterizedSqliteQuery(
  db: QueryExecutorSqliteDatabase,
  request: ParameterizedSqliteQueryRequest,
): ParameterizedSqliteQueryResult {
  return runBoundQuery(db, request.sql, request.params);
}

export function executeParameterizedSqlitePagedQuery(
  db: QueryExecutorSqliteDatabase,
  request: ParameterizedSqlitePagedQueryRequest,
  now: () => number = defaultNow,
): ParameterizedSqlitePagedQueryResult {
  const startedAt = now();
  const queueWaitMs =
    request.clientSentAtMs == null || !Number.isFinite(request.clientSentAtMs)
      ? undefined
      : Math.max(0, Math.round(startedAt - request.clientSentAtMs));
  const pagination =
    request.limit != null && request.limit > 0
      ? `LIMIT ${request.limit}${request.offset != null && request.offset > 0 ? ` OFFSET ${request.offset}` : ""}`
      : "";
  const page = runBoundQuery(
    db,
    `SELECT ${request.selectSql} FROM ${request.fromSql} WHERE ${request.whereSql} ORDER BY ${request.orderBySql} ${pagination};`,
    request.whereParams,
  );
  if (!request.includeTotalCount) {
    return { ...page, totalElements: null, queueWaitMs, workerExecMs: Math.round(now() - startedAt) };
  }

  const count = runBoundQuery(
    db,
    `SELECT COUNT(*) AS total_elements FROM ${request.fromSql} WHERE ${request.whereSql};`,
    request.whereParams,
  );
  return {
    ...page,
    totalElements: Number(count.rows[0]?.[0] ?? 0),
    queueWaitMs,
    workerExecMs: Math.round(now() - startedAt),
  };
}
