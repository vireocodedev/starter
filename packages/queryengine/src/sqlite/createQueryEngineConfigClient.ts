import { SqliteQueryEngineConfigRecordSchema, type SqliteQueryEngineConfigRecord } from "./queryEngineConfigSqlite";

export type QueryEngineConfigClientRuntime = {
  shouldUseInMemoryFallback: () => boolean;
  registerInMemoryStore: (store: { clear: () => void }) => () => void;
};

export type QueryEngineConfigClientTransport = {
  sendRequest: <TResponse>(type: string, payload?: Record<string, unknown>) => Promise<TResponse>;
};

export type QueryEngineConfigClient = {
  replace: (config: SqliteQueryEngineConfigRecord) => Promise<void>;
  get: () => Promise<SqliteQueryEngineConfigRecord | null>;
  setFallback: (config: SqliteQueryEngineConfigRecord | null) => void;
  getFallback: () => SqliteQueryEngineConfigRecord | null;
  dispose: () => void;
};

export function createQueryEngineConfigClient(config: {
  runtime: QueryEngineConfigClientRuntime;
  transport: QueryEngineConfigClientTransport;
  requestTypes?: { replace: string; get: string };
}): QueryEngineConfigClient {
  const requestTypes = config.requestTypes ?? {
    replace: "replaceQueryEngineConfig",
    get: "getQueryEngineConfig",
  };
  if (!requestTypes.replace.trim() || !requestTypes.get.trim()) {
    throw new Error("Query-engine config request types must be non-empty.");
  }
  if (requestTypes.replace === requestTypes.get) {
    throw new Error("Query-engine config replace and get request types must be distinct.");
  }
  let fallback: SqliteQueryEngineConfigRecord | null = null;
  const unregister = config.runtime.registerInMemoryStore({ clear: () => (fallback = null) });

  return {
    async replace(value) {
      const parsedValue = SqliteQueryEngineConfigRecordSchema.parse(value);
      if (config.runtime.shouldUseInMemoryFallback()) {
        fallback = parsedValue;
        return;
      }
      await config.transport.sendRequest<null>(requestTypes.replace, { config: parsedValue });
    },
    async get() {
      if (config.runtime.shouldUseInMemoryFallback()) return fallback;
      return await config.transport.sendRequest<SqliteQueryEngineConfigRecord | null>(requestTypes.get);
    },
    setFallback(value) {
      fallback = value == null ? null : SqliteQueryEngineConfigRecordSchema.parse(value);
    },
    getFallback: () => fallback,
    dispose: unregister,
  };
}
