import { describe, expect, it } from "vitest";
import {
  createManagedSqliteRuntime,
  createSqliteRequestHandlers,
  createSqliteWorkerRuntime,
  createSqliteWorkerRuntimeConfig,
  deleteSqliteRowsByKey,
  dispatchSqliteRequest,
  listSqliteRows,
  mergeSqliteRequestHandlers,
  runSqliteTransaction,
} from "../src";

describe("starter-sqlite exports", () => {
  it("exposes runtime factories", () => {
    expect(typeof createManagedSqliteRuntime).toBe("function");
    expect(typeof createSqliteWorkerRuntime).toBe("function");
    expect(typeof createSqliteWorkerRuntimeConfig).toBe("function");
  });

  it("exposes shared sqlite helpers", () => {
    expect(typeof createSqliteRequestHandlers).toBe("function");
    expect(typeof mergeSqliteRequestHandlers).toBe("function");
    expect(typeof dispatchSqliteRequest).toBe("function");
    expect(typeof runSqliteTransaction).toBe("function");
    expect(typeof listSqliteRows).toBe("function");
    expect(typeof deleteSqliteRowsByKey).toBe("function");
  });
});
