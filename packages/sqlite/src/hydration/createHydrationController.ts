import { type HydrationContributor } from "./createHydrationContributorRegistry";
import { type HydrationRequestBatch, type HydrationRequestQueue } from "./createHydrationRequestQueue";
import { type SqliteHydrationEntityStateRecord } from "../runtime/contracts";

export type RemoteHydrationVersion = { entity: string; revision: number };
export type HydrationRunContext = { heartbeatEnabled?: boolean; heartbeatConnected?: boolean };
export type HydrationLogDetails = Record<string, unknown>;

export type HydrationControllerEvents = {
  registerEntities: (keys: string[]) => void;
  markRunning: (running: boolean) => void;
  markEntityRunning: (key: string) => void;
  markEntitySuccess: (key: string, rowCount: number) => void;
  markEntityError: (key: string, message: string) => void;
  startGate: () => void;
  resetGate: () => void;
  finishGate: () => void;
  markDataReady: () => void;
  setErrorMessage: (message: string | null) => void;
};

export type CreateHydrationControllerConfig<TLockOwner = unknown> = {
  getContributors: () => HydrationContributor[];
  entityStateClient: {
    list: () => Promise<SqliteHydrationEntityStateRecord[]>;
    upsert: (state: SqliteHydrationEntityStateRecord) => Promise<void>;
  };
  requests: Pick<HydrationRequestQueue, "consume" | "hasPending" | "rejectPending" | "settle" | "reject">;
  runHydrationExclusive: (operation: (signal: AbortSignal, lockOwner: TLockOwner) => Promise<void>) => Promise<void>;
  runEntityExclusive: (entityKey: string, operation: () => Promise<void>, lockOwner: TLockOwner) => Promise<void>;
  fetchRemoteVersions: (entityKeys: string[], signal: AbortSignal) => Promise<{ versions: RemoteHydrationVersion[] }>;
  events: HydrationControllerEvents;
  remoteVersionsTimeoutMs: number;
  entityTimeoutMs: (entityKey: string) => number;
  retryBaseMs: number;
  retryMaxMs: number;
  retryExponentLimit?: number;
  elapsedNow?: () => number;
  timestampNow?: () => number;
  schedule?: (callback: () => void, delayMs: number) => ReturnType<typeof setTimeout>;
  cancelScheduled?: (handle: ReturnType<typeof setTimeout>) => void;
  isCancellationError?: (error: unknown) => boolean;
  debug?: (message: string, details?: HydrationLogDetails) => void;
  warn?: (message: string, details?: HydrationLogDetails) => void;
  error?: (message: string, details?: HydrationLogDetails) => void;
};

export type HydrationController = {
  run: (context?: HydrationRunContext) => Promise<void>;
  requestRetry: () => void;
  reset: (pendingRequestReason: string) => void;
  cancelScheduledRetry: () => void;
  dispose: () => void;
  isRunning: () => boolean;
};

function defaultElapsedNow(): number {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

function abortReason(message: string, name: string): Error {
  return typeof DOMException === "undefined" ? new Error(message) : new DOMException(message, name);
}

export function createHydrationController<TLockOwner = unknown>(
  config: CreateHydrationControllerConfig<TLockOwner>,
): HydrationController {
  const elapsedNow = config.elapsedNow ?? defaultElapsedNow;
  const timestampNow = config.timestampNow ?? Date.now;
  const schedule = config.schedule ?? setTimeout;
  const cancelScheduled = config.cancelScheduled ?? clearTimeout;
  const isCancellationError =
    config.isCancellationError ??
    (error => typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError");
  let runningPromise: Promise<void> | null = null;
  let retryCount = 0;
  let retryHandle: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;

  const clearRetry = () => {
    if (retryHandle != null) cancelScheduled(retryHandle);
    retryHandle = null;
  };

  const scheduleRetry = (message: string) => {
    if (retryHandle != null || disposed) return;
    const retryNumber = ++retryCount;
    const retryDelayMs = Math.min(
      config.retryBaseMs * 2 ** Math.min(retryNumber - 1, config.retryExponentLimit ?? 6),
      config.retryMaxMs,
    );
    config.debug?.(message, { retryNumber, retryDelayMs });
    retryHandle = schedule(() => {
      retryHandle = null;
      if (!disposed) config.events.resetGate();
    }, retryDelayMs);
  };

  const withTimeout = async <T>(
    operation: (signal: AbortSignal) => Promise<T>,
    parentSignal: AbortSignal,
    timeoutMs: number,
    timeoutMessage: string,
  ): Promise<T> => {
    const controller = new AbortController();
    let timedOut = false;
    const abortFromParent = () => controller.abort(parentSignal.reason);
    parentSignal.addEventListener("abort", abortFromParent, { once: true });
    const timeoutHandle = schedule(() => {
      timedOut = true;
      controller.abort(abortReason(timeoutMessage, "TimeoutError"));
    }, timeoutMs);

    try {
      const result = await operation(controller.signal);
      controller.signal.throwIfAborted();
      return result;
    } catch (error) {
      if (timedOut) throw new Error(timeoutMessage);
      throw error;
    } finally {
      cancelScheduled(timeoutHandle);
      parentSignal.removeEventListener("abort", abortFromParent);
    }
  };

  const execute = async (context: HydrationRunContext): Promise<void> => {
    const contributors = config.getContributors();
    config.events.registerEntities(contributors.map(entity => entity.key));
    let activeRequestBatch: HydrationRequestBatch | null = null;

    try {
      await config.runHydrationExclusive(async (hydrationSignal, databaseLockOwner) => {
        const requestBatch = config.requests.consume();
        activeRequestBatch = requestBatch;
        const hydrationStartedAt = elapsedNow();
        config.events.markRunning(true);
        config.events.startGate();
        config.events.setErrorMessage(null);
        config.debug?.("Hydration started", {
          entityCount: contributors.length,
          heartbeatEnabled: context.heartbeatEnabled ?? false,
          heartbeatConnected: context.heartbeatConnected ?? false,
        });

        try {
          const hydrationEntityKeys = contributors.map(entity => entity.key).sort((a, b) => a.localeCompare(b));
          const localStateStartedAt = elapsedNow();
          const localStateList = await config.entityStateClient.list();
          config.debug?.("Loaded local hydration metadata", {
            elapsedMs: Math.round(elapsedNow() - localStateStartedAt),
            entityCount: localStateList.length,
          });
          const localStateByKey = new Map(localStateList.map(state => [state.entityKey, state]));
          const remoteRevisionByKey = new Map<string, number>();
          const failedEntityKeys = new Set<string>();
          let hydrationSucceeded = true;
          let remoteRevisionValidationSucceeded = true;
          let canCompareAgainstRemoteVersions = true;

          const remoteVersionsStartedAt = elapsedNow();
          try {
            const remoteVersions = await withTimeout(
              signal => config.fetchRemoteVersions(hydrationEntityKeys, signal),
              hydrationSignal,
              config.remoteVersionsTimeoutMs,
              "Fetching hydration versions timed out.",
            );
            for (const version of remoteVersions.versions) {
              remoteRevisionByKey.set(version.entity.toLowerCase(), Number(version.revision ?? 0));
            }
            config.debug?.("Fetched remote entity revisions", {
              elapsedMs: Math.round(elapsedNow() - remoteVersionsStartedAt),
              entityCount: remoteVersions.versions.length,
            });
          } catch (error) {
            if (hydrationSignal.aborted) throw error;
            canCompareAgainstRemoteVersions = false;
            remoteRevisionValidationSucceeded = false;
            config.warn?.("Could not fetch remote entity revisions; every entity will be hydrated", {
              elapsedMs: Math.round(elapsedNow() - remoteVersionsStartedAt),
              error,
            });
          }

          for (const entity of contributors) {
            hydrationSignal.throwIfAborted();
            const entityStartedAt = elapsedNow();
            config.events.markEntityRunning(entity.key);
            const localState = localStateByKey.get(entity.key);
            const remoteRevision = remoteRevisionByKey.get(entity.key.toLowerCase()) ?? 0;
            const canCompareEntity =
              canCompareAgainstRemoteVersions && remoteRevisionByKey.has(entity.key.toLowerCase());
            const canClearValidationOnlyStaleState =
              canCompareEntity &&
              localState?.isStale === true &&
              localState.lastError == null &&
              localState.appliedRevision === remoteRevision;
            const shouldHydrate =
              requestBatch.forcedKeys.has(entity.key) ||
              !canCompareEntity ||
              localState == null ||
              (localState.isStale && !canClearValidationOnlyStaleState) ||
              localState.appliedRevision !== remoteRevision;

            if (!shouldHydrate) {
              if (canClearValidationOnlyStaleState) {
                await config.entityStateClient.upsert({ ...localState, isStale: false, lastError: null });
              }
              config.events.markEntitySuccess(entity.key, localState.lastRowCount ?? 0);
              config.debug?.("Entity is current; skipped hydration", {
                entity: entity.key,
                elapsedMs: Math.round(elapsedNow() - entityStartedAt),
                revision: remoteRevision,
                rowCount: localState.lastRowCount ?? 0,
              });
              continue;
            }

            config.debug?.("Hydrating entity", {
              entity: entity.key,
              reason: requestBatch.forcedKeys.has(entity.key)
                ? "manual-request"
                : !canCompareEntity
                  ? "remote-revision-unavailable"
                  : localState == null
                    ? "no-local-state"
                    : localState.isStale
                      ? "local-state-stale"
                      : "revision-mismatch",
              localRevision: localState?.appliedRevision ?? null,
              remoteRevision: canCompareEntity ? remoteRevision : null,
            });

            await config.runEntityExclusive(
              entity.key,
              async () => {
                try {
                  const timeoutMs = config.entityTimeoutMs(entity.key);
                  const result = await withTimeout(
                    signal => entity.hydrate(signal),
                    hydrationSignal,
                    timeoutMs,
                    `Hydration timed out after ${timeoutMs}ms for entity "${entity.key}".`,
                  );
                  hydrationSignal.throwIfAborted();
                  const latestState = (await config.entityStateClient.list()).find(
                    state => state.entityKey === entity.key,
                  );
                  hydrationSignal.throwIfAborted();
                  const appliedRevision = canCompareEntity
                    ? Math.max(remoteRevision, latestState?.appliedRevision ?? 0)
                    : (latestState?.appliedRevision ?? localState?.appliedRevision ?? 0);

                  await config.entityStateClient.upsert({
                    entityKey: entity.key,
                    appliedRevision,
                    isStale: !canCompareEntity,
                    lastHydratedAt: timestampNow(),
                    lastRowCount: result.rowCount,
                    lastError: null,
                  });
                  config.events.markEntitySuccess(entity.key, result.rowCount);
                  config.debug?.("Entity hydration completed", {
                    entity: entity.key,
                    elapsedMs: Math.round(elapsedNow() - entityStartedAt),
                    rowCount: result.rowCount,
                  });
                } catch (error) {
                  if (hydrationSignal.aborted) throw error;
                  hydrationSucceeded = false;
                  failedEntityKeys.add(entity.key);
                  const message = error instanceof Error ? error.message : "Unknown hydration error.";
                  config.events.setErrorMessage(message);
                  await config.entityStateClient.upsert({
                    entityKey: entity.key,
                    appliedRevision: localState?.appliedRevision ?? 0,
                    isStale: true,
                    lastHydratedAt: localState?.lastHydratedAt ?? null,
                    lastRowCount: localState?.lastRowCount ?? null,
                    lastError: message,
                  });
                  config.events.markEntityError(entity.key, message);
                  config.error?.("Entity hydration failed", {
                    entity: entity.key,
                    elapsedMs: Math.round(elapsedNow() - entityStartedAt),
                    error,
                  });
                }
              },
              databaseLockOwner,
            );
          }

          if (hydrationSucceeded && remoteRevisionValidationSucceeded) {
            retryCount = 0;
            clearRetry();
            config.events.markDataReady();
          } else {
            scheduleRetry("Hydration retry scheduled");
          }
          config.requests.settle(requestBatch, failedEntityKeys);
        } finally {
          config.debug?.("Hydration finished", { elapsedMs: Math.round(elapsedNow() - hydrationStartedAt) });
          config.events.markRunning(false);
          if (config.requests.hasPending()) config.events.resetGate();
          else config.events.finishGate();
        }
      });
    } catch (error) {
      if (activeRequestBatch) config.requests.reject(activeRequestBatch, error);
      if (isCancellationError(error)) {
        config.debug?.("Hydration cancelled", {
          reason: error instanceof Error ? error.message : "Request cancelled",
        });
        return;
      }

      const message = error instanceof Error ? error.message : "Unknown SQLite storage error.";
      config.events.setErrorMessage(message);
      for (const entity of contributors) config.events.markEntityError(entity.key, message);
      config.error?.("Hydration failed unexpectedly", { error });
      scheduleRetry("Hydration retry scheduled after an unexpected SQLite failure");
    }
  };

  return {
    async run(context = {}) {
      if (disposed) throw new Error("Hydration controller has been disposed.");
      runningPromise ??= execute(context).finally(() => {
        runningPromise = null;
      });
      return await runningPromise;
    },
    requestRetry() {
      clearRetry();
      config.events.setErrorMessage(null);
      config.events.resetGate();
    },
    reset(pendingRequestReason) {
      config.requests.rejectPending(pendingRequestReason);
      clearRetry();
      retryCount = 0;
      config.events.setErrorMessage(null);
      config.events.resetGate();
    },
    cancelScheduledRetry: clearRetry,
    dispose() {
      disposed = true;
      clearRetry();
    },
    isRunning: () => runningPromise != null,
  };
}
