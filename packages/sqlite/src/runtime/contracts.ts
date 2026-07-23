import { type SqliteRequestHandlers } from "../core/sqliteRequestHandlers";
import { type SqliteMigration } from "../core/sqliteTypes";

export type OfflineSyncCommandRecord = {
  commandId: string;
  method: string;
  url: string;
  body: unknown | null;
  headers: Record<string, string>;
  createdAt: number;
};

export type SqliteHydrationEntityStateRecord = {
  entityKey: string;
  appliedRevision: number;
  isStale: boolean;
  lastHydratedAt: number | null;
  lastRowCount: number | null;
  lastError: string | null;
};

export type SqlExecutionStatementResult = {
  statement: string;
  columns: string[];
  rows: unknown[][];
  rowsAffected: number;
};

export type SqlExecutionResult = {
  statements: SqlExecutionStatementResult[];
};

export type SqlPagedQueryRequest = {
  selectSql: string;
  fromSql: string;
  whereSql: string;
  orderBySql: string;
  limit: number | null;
  offset: number | null;
  includeTotalCount?: boolean;
  clientSentAtMs?: number;
};

export type SqlPagedQueryResult = {
  columns: string[];
  rows: unknown[][];
  totalElements: number | null;
  queueWaitMs?: number;
  workerExecMs?: number;
};

export type SqliteWorkerEntityBundleConfig = {
  requestHandlers: SqliteRequestHandlers;
};

export type CreateSqliteWorkerRuntimeConfigInput = {
  dbFile: string;
  migrations: SqliteMigration[];
  entityBundles: SqliteWorkerEntityBundleConfig[];
  debug?: boolean;
  extraRequestHandlers?: SqliteRequestHandlers[];
};
