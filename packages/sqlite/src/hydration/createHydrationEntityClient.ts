import { type InMemorySqliteStore } from "../runtime/createManagedSqliteRuntime";
import { type SqliteTransport } from "../runtime/createSqliteTransport";
import { type SqliteHydrationEntityStateRecord } from "../runtime/contracts";

export type HydrationEntityClientRuntime = {
  shouldUseInMemoryFallback: () => boolean;
  registerInMemoryStore: (store: InMemorySqliteStore) => () => void;
};

export type HydrationEntityClient = {
  list: () => Promise<SqliteHydrationEntityStateRecord[]>;
  upsert: (state: SqliteHydrationEntityStateRecord) => Promise<void>;
  dispose: () => void;
};

export function createHydrationEntityClient(config: {
  runtime: HydrationEntityClientRuntime;
  transport: Pick<SqliteTransport, "sendWorkerRequest">;
}): HydrationEntityClient {
  const inMemoryStates = new Map<string, SqliteHydrationEntityStateRecord>();
  const unregisterStore = config.runtime.registerInMemoryStore(inMemoryStates);

  return {
    async list() {
      if (config.runtime.shouldUseInMemoryFallback()) {
        return [...inMemoryStates.values()].sort((left, right) => left.entityKey.localeCompare(right.entityKey));
      }
      return await config.transport.sendWorkerRequest<SqliteHydrationEntityStateRecord[]>({
        type: "listHydrationEntityStates",
      });
    },
    async upsert(state) {
      if (config.runtime.shouldUseInMemoryFallback()) {
        inMemoryStates.set(state.entityKey, state);
        return;
      }
      await config.transport.sendWorkerRequest<null>({ type: "upsertHydrationEntityState", state });
    },
    dispose: unregisterStore,
  };
}
