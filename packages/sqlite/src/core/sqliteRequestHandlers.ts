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
  return Object.assign({}, ...handlersList);
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
