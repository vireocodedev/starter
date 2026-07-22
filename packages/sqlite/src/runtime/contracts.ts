import { type SqliteRequestHandlers } from "../core/sqliteRequestHandlers";
import { type SqliteMigration } from "../core/sqliteTypes";

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
