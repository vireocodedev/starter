import { type InMemorySqliteStore } from "@/runtime/createManagedSqliteRuntime";
import { type SqliteTransport } from "@/runtime/createSqliteTransport";

type SqliteEntityClientRequest = { type: string; payloadKey: string };

export type SqliteEntityClient<TRecord, TKey> = {
  replace: (records: TRecord[]) => Promise<void>;
  upsert: (record: TRecord) => Promise<void>;
  list: () => Promise<TRecord[]>;
  delete: (keys: TKey[]) => Promise<void>;
};

export type SqliteEntityClientRuntime = {
  shouldUseInMemoryFallback: () => boolean;
  registerInMemoryStore: (store: InMemorySqliteStore) => () => void;
};

export type SqliteEntityClientConfig<TRecord, TKey> = {
  runtime: SqliteEntityClientRuntime;
  transport: Pick<SqliteTransport, "sendWorkerRequest">;
  getKey: (record: TRecord) => TKey;
  compare: (left: TRecord, right: TRecord) => number;
  requests: {
    replace: SqliteEntityClientRequest;
    upsert: SqliteEntityClientRequest;
    list: { type: string };
    delete: SqliteEntityClientRequest;
  };
};

function requestWithPayload(type: string, payloadKey: string, payload: unknown) {
  return { type, [payloadKey]: payload };
}

export function createSqliteEntityClient<TRecord, TKey>(
  config: SqliteEntityClientConfig<TRecord, TKey>,
): SqliteEntityClient<TRecord, TKey> {
  const inMemoryRecords = new Map<TKey, TRecord>();
  config.runtime.registerInMemoryStore(inMemoryRecords);

  return {
    async replace(records) {
      if (config.runtime.shouldUseInMemoryFallback()) {
        inMemoryRecords.clear();
        for (const record of records) inMemoryRecords.set(config.getKey(record), record);
        return;
      }
      await config.transport.sendWorkerRequest<null>(
        requestWithPayload(config.requests.replace.type, config.requests.replace.payloadKey, records),
      );
    },
    async upsert(record) {
      if (config.runtime.shouldUseInMemoryFallback()) {
        inMemoryRecords.set(config.getKey(record), record);
        return;
      }
      await config.transport.sendWorkerRequest<null>(
        requestWithPayload(config.requests.upsert.type, config.requests.upsert.payloadKey, record),
      );
    },
    async list() {
      if (config.runtime.shouldUseInMemoryFallback()) return [...inMemoryRecords.values()].sort(config.compare);
      return await config.transport.sendWorkerRequest<TRecord[]>({ type: config.requests.list.type });
    },
    async delete(keys) {
      if (config.runtime.shouldUseInMemoryFallback()) {
        for (const key of keys) inMemoryRecords.delete(key);
        return;
      }
      await config.transport.sendWorkerRequest<null>(
        requestWithPayload(config.requests.delete.type, config.requests.delete.payloadKey, keys),
      );
    },
  };
}
