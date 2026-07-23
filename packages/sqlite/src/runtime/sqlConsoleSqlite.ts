import { createSqliteRequestHandlers } from "../core/sqliteRequestHandlers";
import { type SqliteDatabase } from "../core/sqliteTypes";
import {
  type SqlExecutionResult,
  type SqlExecutionStatementResult,
  type SqlPagedQueryRequest,
  type SqlPagedQueryResult,
} from "./contracts";

export type SqlConsoleSqliteOperationMap = {
  executeSqlScript: { request: { script: string }; response: SqlExecutionResult };
  executePagedQuery: { request: SqlPagedQueryRequest; response: SqlPagedQueryResult };
};

function nowMs(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }

  return Date.now();
}

function querySingleNumber(db: SqliteDatabase, sql: string): number {
  const statement = db.prepare(sql);

  try {
    if (!statement.step()) {
      return 0;
    }

    const row = statement.get([]);
    return Number(row[0] ?? 0);
  } finally {
    statement.finalize();
  }
}

function splitSqlStatements(script: string): string[] {
  return script
    .split(";")
    .map(part => part.trim())
    .filter(part => part.length > 0);
}

export function executeSqlScript(db: SqliteDatabase, script: string): SqlExecutionResult {
  const statements = splitSqlStatements(script);

  if (statements.length === 0) {
    return { statements: [] };
  }

  const results: SqlExecutionStatementResult[] = [];

  for (const statementSql of statements) {
    const statement = db.prepare(statementSql);

    try {
      const columns = statement.getColumnNames?.([]) ?? [];
      const rows: unknown[][] = [];

      while (statement.step()) {
        rows.push(statement.get([]));
      }

      const rowsAffected = querySingleNumber(db, "SELECT changes();");

      results.push({
        statement: statementSql,
        columns,
        rows,
        rowsAffected,
      });
    } finally {
      statement.finalize();
    }
  }

  return { statements: results };
}

export function executePagedQuery(db: SqliteDatabase, request: SqlPagedQueryRequest): SqlPagedQueryResult {
  const workerStartedAt = nowMs();
  const queueWaitMs =
    Number.isFinite(request.clientSentAtMs) && request.clientSentAtMs != null
      ? Math.max(0, Math.round(workerStartedAt - request.clientSentAtMs))
      : undefined;

  const paginationParts: string[] = [];
  if (request.limit != null && request.limit > 0) {
    paginationParts.push(`LIMIT ${request.limit}`);
    if (request.offset != null && request.offset > 0) {
      paginationParts.push(`OFFSET ${request.offset}`);
    }
  }

  const pageSql = `
    SELECT ${request.selectSql}
    FROM ${request.fromSql}
    WHERE ${request.whereSql}
    ORDER BY ${request.orderBySql}
    ${paginationParts.join(" ")};
  `;

  const pageStatement = db.prepare(pageSql);
  let columns: string[] = [];
  const rows: unknown[][] = [];

  try {
    columns = pageStatement.getColumnNames?.([]) ?? [];

    while (pageStatement.step()) {
      rows.push(pageStatement.get([]));
    }
  } finally {
    pageStatement.finalize();
  }

  if (request.includeTotalCount === false) {
    return {
      columns,
      rows,
      totalElements: null,
      queueWaitMs,
      workerExecMs: Math.round(nowMs() - workerStartedAt),
    };
  }

  const countSql = `
    SELECT COUNT(*) AS total_elements
    FROM ${request.fromSql}
    WHERE ${request.whereSql};
  `;

  const countStatement = db.prepare(countSql);

  try {
    if (!countStatement.step()) {
      return {
        columns,
        rows,
        totalElements: 0,
        queueWaitMs,
        workerExecMs: Math.round(nowMs() - workerStartedAt),
      };
    }

    const row = countStatement.get([]);
    return {
      columns,
      rows,
      totalElements: Number(row[0] ?? 0),
      queueWaitMs,
      workerExecMs: Math.round(nowMs() - workerStartedAt),
    };
  } finally {
    countStatement.finalize();
  }
}

export const SQL_CONSOLE_SQLITE_REQUEST_HANDLERS = createSqliteRequestHandlers({
  executeSqlScript: (db: SqliteDatabase, request) => {
    const typedRequest = request as unknown as { script: string };
    return executeSqlScript(db, typedRequest.script);
  },
  executePagedQuery: (db: SqliteDatabase, request) => {
    return executePagedQuery(db, request as unknown as SqlPagedQueryRequest);
  },
});
