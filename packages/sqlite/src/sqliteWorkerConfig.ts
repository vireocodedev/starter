import { mergeSqliteRequestHandlers } from "./core/sqliteRequestHandlers";
import { type SqliteWorkerRuntimeConfig } from "./core/sqliteWorkerRuntime";
import { type CreateSqliteWorkerRuntimeConfigInput } from "./runtime/contracts";

export function createSqliteWorkerRuntimeConfig(
  input: CreateSqliteWorkerRuntimeConfigInput,
): SqliteWorkerRuntimeConfig {
  if (input.dbFile.trim().length === 0) {
    throw new Error("SQLite worker configuration requires a non-empty dbFile.");
  }

  return {
    dbFile: input.dbFile,
    migrations: input.migrations,
    debug: input.debug,
    requestHandlers: mergeSqliteRequestHandlers(
      ...input.entityBundles.map(bundle => bundle.requestHandlers),
      ...(input.extraRequestHandlers ?? []),
    ),
  };
}
