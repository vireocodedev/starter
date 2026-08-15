export type HydrationEntityStatus = {
  key: string;
  state: "idle" | "running" | "success" | "error";
  lastAttemptAt: number | null;
  lastSuccessAt: number | null;
  rowCount: number | null;
  errorMessage: string | null;
};

export type HydrationStatusSnapshot = {
  entities: HydrationEntityStatus[];
  running: boolean;
};

export type HydrationStatus = {
  getSnapshot: () => HydrationStatusSnapshot;
  subscribe: (listener: (snapshot: HydrationStatusSnapshot) => void) => () => void;
  registerEntities: (keys: string[]) => void;
  markRunning: (running: boolean) => void;
  markEntityRunning: (key: string) => void;
  markEntitySuccess: (key: string, rowCount: number) => void;
  markEntityError: (key: string, errorMessage: string) => void;
  reset: () => void;
};

export type CreateHydrationStatusConfig = { now?: () => number };

function idleEntity(key: string): HydrationEntityStatus {
  return {
    key,
    state: "idle",
    lastAttemptAt: null,
    lastSuccessAt: null,
    rowCount: null,
    errorMessage: null,
  };
}

export function createHydrationStatus(config: CreateHydrationStatusConfig = {}): HydrationStatus {
  const now = config.now ?? Date.now;
  const listeners = new Set<(snapshot: HydrationStatusSnapshot) => void>();
  let entitiesByKey: Record<string, HydrationEntityStatus> = {};
  let running = false;

  const getSnapshot = (): HydrationStatusSnapshot => ({
    running,
    entities: Object.values(entitiesByKey).sort((left, right) => left.key.localeCompare(right.key)),
  });
  const publish = () => {
    const snapshot = getSnapshot();
    for (const listener of listeners) listener(snapshot);
  };
  const upsert = (key: string, status: Partial<HydrationEntityStatus>) => {
    entitiesByKey = { ...entitiesByKey, [key]: { ...(entitiesByKey[key] ?? idleEntity(key)), ...status } };
    publish();
  };

  return {
    getSnapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    registerEntities(keys) {
      let changed = false;
      let next = entitiesByKey;
      for (const key of keys) {
        if (next[key]) continue;
        changed = true;
        next = { ...next, [key]: idleEntity(key) };
      }
      if (changed) {
        entitiesByKey = next;
        publish();
      }
    },
    markRunning(value) {
      if (running === value) return;
      running = value;
      publish();
    },
    markEntityRunning(key) {
      upsert(key, { state: "running", lastAttemptAt: now(), errorMessage: null });
    },
    markEntitySuccess(key, rowCount) {
      upsert(key, { state: "success", lastSuccessAt: now(), rowCount, errorMessage: null });
    },
    markEntityError(key, errorMessage) {
      upsert(key, { state: "error", errorMessage });
    },
    reset() {
      if (!running && Object.keys(entitiesByKey).length === 0) return;
      running = false;
      entitiesByKey = {};
      publish();
    },
  };
}
