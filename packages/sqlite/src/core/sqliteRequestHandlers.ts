import { type SqliteDatabase } from "./sqliteTypes";
import { type WorkerRequest, type WorkerResponseResult } from "./sqliteWorkerProtocol";

export type SqliteRequestHandler = (
  db: SqliteDatabase,
  request: WorkerRequest,
) => WorkerResponseResult | Promise<WorkerResponseResult>;

export type SqliteRequestHandlers = Partial<Record<string, SqliteRequestHandler>>;

export function createSqliteRequestHandlers<THandlers extends SqliteRequestHandlers>(handlers: THandlers): THandlers {
  return handlers;
}

export function mergeSqliteRequestHandlers(...handlersList: SqliteRequestHandlers[]): SqliteRequestHandlers {
  const merged: SqliteRequestHandlers = {};

  for (const handlers of handlersList) {
    for (const [operation, handler] of Object.entries(handlers)) {
      if (operation in merged) {
        throw new Error(`SQLite request handler operation "${operation}" is registered more than once.`);
      }

      merged[operation] = handler;
    }
  }

  return merged;
}

export async function dispatchSqliteRequest(
  db: SqliteDatabase,
  request: WorkerRequest,
  handlers: SqliteRequestHandlers,
): Promise<WorkerResponseResult | undefined> {
  const handler = handlers[request.type];
  if (!handler) {
    return undefined;
  }

  return await handler(db, request);
}
