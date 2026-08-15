import { type SqliteQueryEngineConfigRecord } from "@/sqlite/queryEngineConfigSqlite";

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
  let fallback: SqliteQueryEngineConfigRecord | null = null;
  const unregister = config.runtime.registerInMemoryStore({ clear: () => (fallback = null) });

  return {
    async replace(value) {
      if (config.runtime.shouldUseInMemoryFallback()) {
        fallback = value;
        return;
      }
      await config.transport.sendRequest<null>(requestTypes.replace, { config: value });
    },
    async get() {
      if (config.runtime.shouldUseInMemoryFallback()) return fallback;
      return await config.transport.sendRequest<SqliteQueryEngineConfigRecord | null>(requestTypes.get);
    },
    setFallback(value) {
      fallback = value;
    },
    getFallback: () => fallback,
    dispose: unregister,
  };
}
