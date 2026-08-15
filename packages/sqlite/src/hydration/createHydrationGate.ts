export type HydrationGatePhase = "idle" | "running" | "finished";

export type HydrationGateSnapshot = {
  phase: HydrationGatePhase;
  startedAt: number | null;
  dataReady: boolean;
  errorMessage: string | null;
  retryRequestTick: number;
};

export type HydrationGate = {
  getSnapshot: () => HydrationGateSnapshot;
  subscribe: (listener: (snapshot: HydrationGateSnapshot) => void) => () => void;
  setErrorMessage: (message: string | null) => void;
  requestRetry: () => void;
  reset: () => void;
  start: () => void;
  finish: () => void;
  markDataReady: () => void;
};

export type CreateHydrationGateConfig = { now?: () => number };

const INITIAL_SNAPSHOT: HydrationGateSnapshot = {
  phase: "idle",
  startedAt: null,
  dataReady: false,
  errorMessage: null,
  retryRequestTick: 0,
};

export function createHydrationGate(config: CreateHydrationGateConfig = {}): HydrationGate {
  const now = config.now ?? Date.now;
  const listeners = new Set<(snapshot: HydrationGateSnapshot) => void>();
  let snapshot = INITIAL_SNAPSHOT;

  const publish = (next: HydrationGateSnapshot) => {
    if (
      next.phase === snapshot.phase &&
      next.startedAt === snapshot.startedAt &&
      next.dataReady === snapshot.dataReady &&
      next.errorMessage === snapshot.errorMessage &&
      next.retryRequestTick === snapshot.retryRequestTick
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
    setErrorMessage(errorMessage) {
      publish({ ...snapshot, errorMessage });
    },
    requestRetry() {
      publish({ ...snapshot, retryRequestTick: snapshot.retryRequestTick + 1 });
    },
    reset() {
      publish({ ...snapshot, phase: "idle", startedAt: null, dataReady: false });
    },
    start() {
      publish({ ...snapshot, phase: "running", startedAt: snapshot.startedAt ?? now() });
    },
    finish() {
      publish({ ...snapshot, phase: "finished" });
    },
    markDataReady() {
      publish({ ...snapshot, dataReady: true });
    },
  };
}
