const sqliteOperationLockOwnerBrand: unique symbol = Symbol("sqliteOperationLockOwner");

export type SqliteOperationLockOwner = { readonly [sqliteOperationLockOwnerBrand]: true };

export type ExclusiveLockManager = {
  request: <T>(name: string, options: { mode: "exclusive" }, callback: () => Promise<T>) => Promise<T>;
};

export type CreateSqliteOperationCoordinatorConfig = {
  lockName: string;
  getLockManager?: () => ExclusiveLockManager | null;
  createAbortReason?: (reason: string) => unknown;
};

export type SqliteOperationCoordinator = {
  runDatabaseExclusive: <T>(
    operation: (lockOwner: SqliteOperationLockOwner) => Promise<T>,
    lockOwner?: SqliteOperationLockOwner,
  ) => Promise<T>;
  runEntityExclusive: <T>(
    entityKey: string,
    operation: (lockOwner: SqliteOperationLockOwner) => Promise<T>,
    lockOwner?: SqliteOperationLockOwner,
  ) => Promise<T>;
  runHydrationExclusive: (
    operation: (signal: AbortSignal, lockOwner: SqliteOperationLockOwner) => Promise<void>,
  ) => Promise<void>;
  abortHydration: (reason?: string) => void;
  awaitHydrationIdle: () => Promise<void>;
};

function defaultAbortReason(reason: string): unknown {
  return typeof DOMException === "undefined" ? new Error(reason) : new DOMException(reason, "AbortError");
}

/** Creates isolated local queues with optional cross-context serialization through Web Locks. */
export function createSqliteOperationCoordinator(
  config: CreateSqliteOperationCoordinatorConfig,
): SqliteOperationCoordinator {
  const entityOperationTails = new Map<string, Promise<void>>();
  const activeLockOwners = new WeakSet<SqliteOperationLockOwner>();
  let localDatabaseOperationTail: Promise<void> = Promise.resolve();
  let inFlightHydration: Promise<void> | null = null;
  let hydrationAbortController: AbortController | null = null;

  const runLocalExclusive = async <T>(operation: () => Promise<T>): Promise<T> => {
    const previous = localDatabaseOperationTail;
    const result = previous.catch(() => undefined).then(operation);
    localDatabaseOperationTail = result.then(
      () => undefined,
      () => undefined,
    );
    return await result;
  };

  const runDatabaseExclusive = async <T>(
    operation: (lockOwner: SqliteOperationLockOwner) => Promise<T>,
    lockOwner?: SqliteOperationLockOwner,
  ): Promise<T> => {
    if (lockOwner != null && activeLockOwners.has(lockOwner)) return await operation(lockOwner);

    const runOwned = async () => {
      const activeLockOwner = {} as SqliteOperationLockOwner;
      activeLockOwners.add(activeLockOwner);
      try {
        return await operation(activeLockOwner);
      } finally {
        activeLockOwners.delete(activeLockOwner);
      }
    };

    const lockManager = config.getLockManager?.() ?? null;
    return lockManager
      ? await lockManager.request(config.lockName, { mode: "exclusive" }, runOwned)
      : await runLocalExclusive(runOwned);
  };

  const runEntityQueueExclusive = async <T>(entityKey: string, operation: () => Promise<T>): Promise<T> => {
    const previous = entityOperationTails.get(entityKey) ?? Promise.resolve();
    const result = previous.catch(() => undefined).then(operation);
    const tail = result.then(
      () => undefined,
      () => undefined,
    );
    entityOperationTails.set(entityKey, tail);

    try {
      return await result;
    } finally {
      if (entityOperationTails.get(entityKey) === tail) entityOperationTails.delete(entityKey);
    }
  };

  const runEntityExclusive = async <T>(
    entityKey: string,
    operation: (lockOwner: SqliteOperationLockOwner) => Promise<T>,
    lockOwner?: SqliteOperationLockOwner,
  ): Promise<T> =>
    await runDatabaseExclusive(
      activeLockOwner => runEntityQueueExclusive(entityKey, () => operation(activeLockOwner)),
      lockOwner,
    );

  const runHydrationExclusive = async (
    operation: (signal: AbortSignal, lockOwner: SqliteOperationLockOwner) => Promise<void>,
  ): Promise<void> => {
    if (inFlightHydration) return await inFlightHydration;

    hydrationAbortController = new AbortController();
    const controller = hydrationAbortController;
    inFlightHydration = runDatabaseExclusive(lockOwner => {
      controller.signal.throwIfAborted();
      return operation(controller.signal, lockOwner);
    }).finally(() => {
      inFlightHydration = null;
      if (hydrationAbortController === controller) hydrationAbortController = null;
    });
    return await inFlightHydration;
  };

  return {
    runDatabaseExclusive,
    runEntityExclusive,
    runHydrationExclusive,
    abortHydration(reason = "SQLite hydration was cancelled.") {
      hydrationAbortController?.abort((config.createAbortReason ?? defaultAbortReason)(reason));
    },
    async awaitHydrationIdle() {
      await inFlightHydration?.catch(() => undefined);
    },
  };
}
