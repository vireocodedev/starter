import { mergeSqliteRequestHandlers } from "./core/sqliteRequestHandlers";
import { type SqliteWorkerRuntimeConfig } from "./core/sqliteWorkerRuntime";
import { type CreateSqliteWorkerRuntimeConfigInput } from "./runtime/contracts";

export function createSqliteWorkerRuntimeConfig(
  input: CreateSqliteWorkerRuntimeConfigInput,
): SqliteWorkerRuntimeConfig {
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
