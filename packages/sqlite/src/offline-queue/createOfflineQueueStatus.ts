import { type OfflineQueueStatusCounts } from "./offlineQueueStateSqlite";

export type OfflineQueueStatusSnapshot = OfflineQueueStatusCounts & { enqueueTick: number };
export type OfflineQueueStatusListener = (snapshot: OfflineQueueStatusSnapshot) => void;

export type OfflineQueueStatus = {
  getSnapshot: () => OfflineQueueStatusSnapshot;
  subscribe: (listener: OfflineQueueStatusListener) => () => void;
  markEnqueued: () => void;
  refresh: () => Promise<void>;
  resetCounts: () => void;
};

export type CreateOfflineQueueStatusConfig = {
  readStatusCounts: () => Promise<OfflineQueueStatusCounts>;
  onReadError?: (error: unknown) => void;
};

const INITIAL_COUNTS: OfflineQueueStatusCounts = { pending: 0, permanentlyFailed: 0 };

/** Framework-neutral observable queue status with non-blocking persistence refreshes. */
export function createOfflineQueueStatus(config: CreateOfflineQueueStatusConfig): OfflineQueueStatus {
  const listeners = new Set<OfflineQueueStatusListener>();
  let snapshot: OfflineQueueStatusSnapshot = { ...INITIAL_COUNTS, enqueueTick: 0 };

  const publish = (next: OfflineQueueStatusSnapshot) => {
    if (
      next.pending === snapshot.pending &&
      next.permanentlyFailed === snapshot.permanentlyFailed &&
      next.enqueueTick === snapshot.enqueueTick
    ) {
      return;
    }
    snapshot = next;
    for (const listener of listeners) listener(snapshot);
  };

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    markEnqueued() {
      publish({ ...snapshot, enqueueTick: snapshot.enqueueTick + 1 });
    },
    async refresh() {
      try {
        const counts = await config.readStatusCounts();
        publish({ ...counts, enqueueTick: snapshot.enqueueTick });
      } catch (error) {
        config.onReadError?.(error);
      }
    },
    resetCounts() {
      publish({ ...INITIAL_COUNTS, enqueueTick: snapshot.enqueueTick });
    },
  };
}
