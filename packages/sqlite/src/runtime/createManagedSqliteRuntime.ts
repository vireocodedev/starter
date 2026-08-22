import {
  type WorkerRequest,
  type WorkerRequestInput,
  type WorkerResponse,
  type WorkerResponseResult,
} from "../core/sqliteWorkerProtocol";

export type InMemorySqliteStore = { clear: () => void };

export type ManagedSqliteRuntimeConfig = {
  workerFactory: () => Worker;
  shouldUseInMemoryFallback?: () => boolean;
  debug?: boolean;
  bootLogPrefix?: string;
  now?: () => number;
};

export type ManagedSqliteRuntime = {
  registerInMemoryStore: (store: InMemorySqliteStore) => () => void;
  clearInMemoryStores: () => void;
  shouldUseInMemoryFallback: () => boolean;
  send: <T extends WorkerResponseResult>(payload: WorkerRequestInput) => Promise<T>;
  ensureInitialized: () => Promise<void>;
  warmup: () => Promise<void>;
  reset: () => void;
  dispose: () => void;
};

function defaultNow(): number {
  return typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
}

/** Owns worker lifecycle, initialization, pending requests, fallback stores and deterministic teardown. */
export function createManagedSqliteRuntime(config: ManagedSqliteRuntimeConfig): ManagedSqliteRuntime {
  const bootLogPrefix = config.bootLogPrefix ?? "[SQLITE-BOOT]";
  const now = config.now ?? defaultNow;
  const inMemoryStores = new Set<InMemorySqliteStore>();
  const pending = new Map<
    number,
    { resolve: (value: WorkerResponseResult) => void; reject: (reason?: unknown) => void }
  >();

  let worker: Worker | null = null;
  let nextRequestId = 1;
  let initialized = false;
  let initializingPromise: Promise<void> | null = null;
  let initializationGeneration = 0;
  let disposed = false;

  const log = (message: string, ...details: unknown[]) => {
    if (config.debug) console.debug(`${bootLogPrefix} ${message}`, ...details);
  };

  const assertActive = () => {
    if (disposed) throw new Error("SQLite runtime has been disposed.");
  };

  const rejectPending = (reason: Error) => {
    for (const handler of pending.values()) handler.reject(reason);
    pending.clear();
  };

  const teardownWorker = (reason: Error) => {
    worker?.terminate();
    worker = null;
    initialized = false;
    initializingPromise = null;
    initializationGeneration += 1;
    rejectPending(reason);
  };

  const getWorker = () => {
    assertActive();
    if (worker) return worker;

    worker = config.workerFactory();
    worker.addEventListener("message", event => {
      const message = event.data as WorkerResponse;
      const handler = pending.get(message.id);
      if (!handler) return;

      pending.delete(message.id);
      if (message.ok) handler.resolve(message.result);
      else handler.reject(new Error(message.error));
    });
    worker.addEventListener("error", event => {
      const error = event.error instanceof Error ? event.error : new Error(event.message);
      teardownWorker(error);
    });
    worker.addEventListener("messageerror", () => {
      teardownWorker(new Error("SQLite worker returned an unreadable message."));
    });
    return worker;
  };

  const send = async <T extends WorkerResponseResult>(payload: WorkerRequestInput): Promise<T> => {
    const id = nextRequestId++;
    const activeWorker = getWorker();

    return await new Promise<T>((resolve, reject) => {
      pending.set(id, { resolve: value => resolve(value as T), reject });
      try {
        activeWorker.postMessage({ id, ...payload } as WorkerRequest);
      } catch (error) {
        pending.delete(id);
        reject(error);
      }
    });
  };

  const ensureInitialized = async (): Promise<void> => {
    assertActive();
    if (initialized) return;
    if (initializingPromise) return await initializingPromise;

    const startedAt = now();
    const generation = ++initializationGeneration;
    log("client init request -> worker");
    const currentInitialization = (async () => {
      try {
        await send<null>({ type: "init" });
        initialized = true;
        log(`client init completed in ${Math.round(now() - startedAt)}ms`);
      } catch (error) {
        log(`client init failed after ${Math.round(now() - startedAt)}ms`, error);
        throw error;
      } finally {
        if (initializationGeneration === generation) initializingPromise = null;
      }
    })();
    initializingPromise = currentInitialization;
    await currentInitialization;
  };

  return {
    registerInMemoryStore(store) {
      inMemoryStores.add(store);
      return () => inMemoryStores.delete(store);
    },
    clearInMemoryStores() {
      for (const store of inMemoryStores) store.clear();
    },
    shouldUseInMemoryFallback: () => config.shouldUseInMemoryFallback?.() ?? false,
    send,
    ensureInitialized,
    warmup: ensureInitialized,
    reset() {
      assertActive();
      teardownWorker(new Error("SQLite runtime was reset."));
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      teardownWorker(new Error("SQLite runtime was disposed."));
      inMemoryStores.clear();
    },
  };
}
