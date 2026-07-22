import { dispatchSqliteRequest, type SqliteRequestHandlers } from "./sqliteRequestHandlers";
import { initializeSqliteDatabase, mapSqliteRuntimeError } from "./sqliteRuntime";
import { type SqliteDatabase, type SqliteMigration } from "./sqliteTypes";
import { type WorkerRequest, type WorkerResponse, type WorkerResponseResult } from "./sqliteWorkerProtocol";

type WorkerLike = {
  addEventListener: (type: "message", listener: (event: MessageEvent<unknown>) => void | Promise<void>) => void;
  postMessage: (message: unknown) => void;
};

export type SqliteWorkerRuntimeConfig = {
  dbFile: string;
  migrations: SqliteMigration[];
  requestHandlers: SqliteRequestHandlers;
  debug?: boolean;
  bootLogPrefix?: string;
};

function nowMs(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }

  return Date.now();
}

export function createSqliteWorkerRuntime(config: SqliteWorkerRuntimeConfig) {
  const bootLogPrefix = config.bootLogPrefix ?? "[SQLITE-BOOT]";

  let sqliteDb: SqliteDatabase | null = null;
  let sqliteDbInitializingPromise: Promise<void> | null = null;

  function logSqliteBoot(message: string, ...details: unknown[]): void {
    if (!config.debug) {
      return;
    }

    console.debug(`${bootLogPrefix} ${message}`, ...details);
  }

  function postResponse(worker: WorkerLike, response: WorkerResponse): void {
    worker.postMessage(response);
  }

  function requireDatabase(): SqliteDatabase {
    if (sqliteDb == null) {
      throw new Error("SQLite database is not initialized.");
    }

    return sqliteDb;
  }

  async function ensureInitialized(): Promise<void> {
    if (sqliteDb != null) {
      return;
    }

    if (sqliteDbInitializingPromise != null) {
      logSqliteBoot("worker init wait for in-flight initialization");
      await sqliteDbInitializingPromise;
      return;
    }

    const startedAt = nowMs();
    logSqliteBoot("worker init start");

    sqliteDbInitializingPromise = (async () => {
      try {
        sqliteDb = await initializeSqliteDatabase(config.dbFile, config.migrations);
        logSqliteBoot(`worker init done in ${Math.round(nowMs() - startedAt)}ms`);
      } finally {
        sqliteDbInitializingPromise = null;
      }
    })();

    await sqliteDbInitializingPromise;
  }

  async function tryHandleSqliteRequest(request: WorkerRequest): Promise<WorkerResponseResult | undefined> {
    return await dispatchSqliteRequest(requireDatabase(), request, config.requestHandlers);
  }

  async function handleRequest(worker: WorkerLike, request: WorkerRequest): Promise<void> {
    try {
      await ensureInitialized();

      if (request.type === "init") {
        postResponse(worker, { id: request.id, ok: true, result: null });
        return;
      }

      const requestResult = await tryHandleSqliteRequest(request);
      if (requestResult !== undefined) {
        postResponse(worker, { id: request.id, ok: true, result: requestResult });
        return;
      }

      throw new Error(`Unsupported worker request: ${JSON.stringify(request)}`);
    } catch (error) {
      postResponse(worker, { id: request.id, ok: false, error: mapSqliteRuntimeError(error) });
    }
  }

  function attach(worker: WorkerLike): void {
    worker.addEventListener("message", async event => {
      await handleRequest(worker, event.data as WorkerRequest);
    });
  }

  return {
    attach,
    handleRequest,
  };
}
