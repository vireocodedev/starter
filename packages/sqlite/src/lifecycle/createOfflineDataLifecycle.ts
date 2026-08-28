export type OfflineDataLifecyclePhase = "hydration" | "queue" | "storage";
export type OfflineDataLifecycleOptions = { onPhase?: (phase: OfflineDataLifecyclePhase) => void };

export type CreateOfflineDataLifecycleConfig = {
  readOwner: () => string | null;
  persistOwner: (owner: string) => void;
  resolveDatabaseFileName: (owner: string, legacyOwner: string | null) => string;
  abortHydration: (reason: string) => void;
  awaitHydrationIdle: () => Promise<void>;
  awaitLocalReflectionIdle: () => Promise<void>;
  awaitQueueFlushIdle: () => Promise<void>;
  resetHydrationGate: () => void;
  resetHydrationStatus: () => void;
  resetQueueStatus: () => void;
  resetRuntime: () => void;
  clearInMemoryStores: () => void;
  deleteDatabaseFiles: (fileName?: string) => Promise<void>;
  hydrationAbortReason?: string;
};

export type OfflineDataLifecycle = {
  release: (options?: OfflineDataLifecycleOptions) => Promise<void>;
  purge: (options?: OfflineDataLifecycleOptions) => Promise<void>;
  ensureOwnedBy: (owner: string) => Promise<boolean>;
};

export function createOfflineDataLifecycle(config: CreateOfflineDataLifecycleConfig): OfflineDataLifecycle {
  let ownerReconciliationTail: Promise<void> = Promise.resolve();

  const quiesce = async (options: OfflineDataLifecycleOptions) => {
    options.onPhase?.("hydration");
    config.abortHydration(config.hydrationAbortReason ?? "SQLite hydration was cancelled before purging local data.");
    await config.awaitHydrationIdle();
    await config.awaitLocalReflectionIdle();

    options.onPhase?.("queue");
    await config.awaitQueueFlushIdle();
    config.resetHydrationGate();
    config.resetHydrationStatus();
    config.resetQueueStatus();
    config.resetRuntime();
    config.clearInMemoryStores();
  };

  const release = async (options: OfflineDataLifecycleOptions = {}) => {
    await quiesce(options);
    options.onPhase?.("storage");
  };

  const purge = async (options: OfflineDataLifecycleOptions = {}) => {
    const owner = config.readOwner();
    const fileName = owner == null ? undefined : config.resolveDatabaseFileName(owner, owner);
    await quiesce(options);
    options.onPhase?.("storage");
    await config.deleteDatabaseFiles(fileName);
  };

  const reconcileOwner = async (owner: string): Promise<boolean> => {
    const previousOwner = config.readOwner();
    if (previousOwner === owner) {
      config.resolveDatabaseFileName(owner, previousOwner);
      return false;
    }

    if (previousOwner != null) await release();
    config.persistOwner(owner);
    config.resolveDatabaseFileName(owner, previousOwner);
    return previousOwner != null;
  };

  return {
    release,
    purge,
    async ensureOwnedBy(owner) {
      const reconciliation = ownerReconciliationTail.then(() => reconcileOwner(owner));
      ownerReconciliationTail = reconciliation.then(
        () => undefined,
        () => undefined,
      );
      return await reconciliation;
    },
  };
}
