import {
  type WorkerRequest,
  type WorkerRequestInput,
  type WorkerResponse,
  type WorkerResponseResult,
} from "./sqliteWorkerProtocol";

export type SqliteClientRuntimeConfig = {
  workerFactory: () => Worker;
  debug?: boolean;
  bootLogPrefix?: string;
};

function nowMs(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }

  return Date.now();
}

export function createSqliteClientRuntime(config: SqliteClientRuntimeConfig) {
  const bootLogPrefix = config.bootLogPrefix ?? "[SQLITE-BOOT]";

  let workerInstance: Worker | null = null;
  let nextRequestId = 1;
  let initialized = false;
  let initializingPromise: Promise<void> | null = null;

  const pending = new Map<
    number,
    {
      resolve: (value: WorkerResponseResult) => void;
      reject: (reason?: unknown) => void;
    }
  >();

  function logSqliteBoot(message: string, ...details: unknown[]): void {
    if (!config.debug) {
      return;
    }

    console.debug(`${bootLogPrefix} ${message}`, ...details);
  }

  function getWorker(): Worker {
    if (workerInstance != null) {
      return workerInstance;
    }

    workerInstance = config.workerFactory();

    workerInstance.addEventListener("message", event => {
      const message = event.data as WorkerResponse;
      const handler = pending.get(message.id);
      if (!handler) {
        return;
      }

      pending.delete(message.id);
      if (message.ok) {
        handler.resolve(message.result);
        return;
      }

      handler.reject(new Error(message.error));
    });

    workerInstance.addEventListener("error", event => {
      const error = event.error instanceof Error ? event.error : new Error(event.message);
      pending.forEach(handler => handler.reject(error));
      pending.clear();
    });

    return workerInstance;
  }

  async function send<T extends WorkerResponseResult>(payload: WorkerRequestInput): Promise<T> {
    const id = nextRequestId++;
    const worker = getWorker();

    return await new Promise<T>((resolve, reject) => {
      pending.set(id, {
        resolve: value => resolve(value as T),
        reject,
      });

      worker.postMessage({ id, ...payload } as WorkerRequest);
    });
  }

  async function ensureInitialized(): Promise<void> {
    if (initialized) {
      return;
    }

    if (initializingPromise != null) {
      logSqliteBoot("client init wait for in-flight initialization");
      await initializingPromise;
      return;
    }

    const startedAt = nowMs();
    logSqliteBoot("client init request -> worker");

    initializingPromise = (async () => {
      try {
        await send<null>({ type: "init" });
        initialized = true;
        logSqliteBoot(`client init completed in ${Math.round(nowMs() - startedAt)}ms`);
      } catch (error) {
        logSqliteBoot(`client init failed after ${Math.round(nowMs() - startedAt)}ms`, error);
        throw error;
      } finally {
        initializingPromise = null;
      }
    })();

    await initializingPromise;
  }

  async function warmup(): Promise<void> {
    await ensureInitialized();
  }

  return {
    send,
    ensureInitialized,
    warmup,
  };
}
