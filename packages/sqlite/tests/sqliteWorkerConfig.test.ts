import { createSqliteWorkerRuntimeConfig } from "@/sqliteWorkerConfig";
import { describe, expect, it } from "vitest";

describe("createSqliteWorkerRuntimeConfig", () => {
  it("rejects an empty database filename", () => {
    expect(() =>
      createSqliteWorkerRuntimeConfig({
        dbFile: "  ",
        migrations: [],
        entityBundles: [],
      }),
    ).toThrow("SQLite worker configuration requires a non-empty dbFile.");
  });

  it("rejects operation collisions between entity bundles and extra handlers", () => {
    expect(() =>
      createSqliteWorkerRuntimeConfig({
        dbFile: "app.sqlite3",
        migrations: [],
        entityBundles: [{ requestHandlers: { listCustomers: () => [] } }],
        extraRequestHandlers: [{ listCustomers: () => [] }],
      }),
    ).toThrow('SQLite request handler operation "listCustomers" is registered more than once.');
  });
});
