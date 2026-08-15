import {
  createQueryEngineConfigClient,
  createQueryEngineConfigSqliteRequestHandlers,
  getQueryEngineConfig,
  replaceQueryEngineConfig,
  type QueryEngineConfigSqliteStatement,
} from "@/index";
import { describe, expect, it, vi } from "vitest";

const snapshot = {
  entities: [{ key: "PRODUCT" }],
  entityDefinitions: { PRODUCT: { title: "Products" } },
};

describe("createQueryEngineConfigClient", () => {
  it("keeps fallback state instance-local and clears it through the runtime store", async () => {
    const stores: Array<{ clear: () => void }> = [];
    const runtime = {
      shouldUseInMemoryFallback: () => true,
      registerInMemoryStore: (store: { clear: () => void }) => {
        stores.push(store);
        return vi.fn();
      },
    };
    const transport = { sendRequest: vi.fn() };
    const first = createQueryEngineConfigClient({ runtime, transport });
    const second = createQueryEngineConfigClient({ runtime, transport });

    await first.replace(snapshot);
    await expect(first.get()).resolves.toEqual(snapshot);
    await expect(second.get()).resolves.toBeNull();
    stores[0].clear();
    await expect(first.get()).resolves.toBeNull();
    expect(transport.sendRequest).not.toHaveBeenCalled();
  });

  it("uses the injected request transport outside fallback mode", async () => {
    const transport = { sendRequest: vi.fn().mockResolvedValue(snapshot) };
    const client = createQueryEngineConfigClient({
      runtime: { shouldUseInMemoryFallback: () => false, registerInMemoryStore: () => vi.fn() },
      transport,
      requestTypes: { replace: "putConfig", get: "readConfig" },
    });

    await client.replace(snapshot);
    await expect(client.get()).resolves.toEqual(snapshot);
    expect(transport.sendRequest).toHaveBeenNthCalledWith(1, "putConfig", { config: snapshot });
    expect(transport.sendRequest).toHaveBeenNthCalledWith(2, "readConfig");
  });
});

describe("query-engine config SQLite persistence", () => {
  function statement(overrides: Partial<QueryEngineConfigSqliteStatement> = {}) {
    return {
      bind: vi.fn(),
      step: vi.fn(() => true),
      get: vi.fn(() => [JSON.stringify(snapshot.entities), JSON.stringify(snapshot.entityDefinitions)]),
      finalize: vi.fn(),
      ...overrides,
    } satisfies QueryEngineConfigSqliteStatement;
  }

  it("writes the configured table with bound JSON values", () => {
    const prepared = statement();
    let preparedSql = "";
    const db = {
      prepare: vi.fn((sql: string) => {
        preparedSql = sql;
        return prepared;
      }),
    };
    replaceQueryEngineConfig(db, snapshot, { tableName: "app_query_config", singletonKey: "current" });

    expect(preparedSql).toContain("INSERT INTO app_query_config");
    expect(prepared.bind).toHaveBeenCalledWith([
      "current",
      JSON.stringify(snapshot.entities),
      JSON.stringify(snapshot.entityDefinitions),
    ]);
    expect(prepared.finalize).toHaveBeenCalledOnce();
  });

  it("reads and safely parses the stored config", () => {
    const prepared = statement();
    const db = { prepare: vi.fn(() => prepared) };

    expect(getQueryEngineConfig(db, { tableName: "app_query_config" })).toEqual(snapshot);
    expect(prepared.bind).toHaveBeenCalledWith(["singleton"]);
    expect(prepared.finalize).toHaveBeenCalledOnce();
  });

  it("creates configurable worker request handlers", () => {
    const handlers = createQueryEngineConfigSqliteRequestHandlers({
      tableName: "app_query_config",
      requestTypes: { replace: "put", get: "read" },
    });

    expect(Object.keys(handlers).sort()).toEqual(["put", "read"]);
  });
});
