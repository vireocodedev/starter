import { describe, expect, it } from "vitest";
import {
  createSqliteClientRuntime,
  createSqliteWorkerRuntime,
  createSqliteWorkerRuntimeConfig,
} from "../src";

describe("starter-sqlite exports", () => {
  it("exposes runtime factories", () => {
    expect(typeof createSqliteClientRuntime).toBe("function");
    expect(typeof createSqliteWorkerRuntime).toBe("function");
    expect(typeof createSqliteWorkerRuntimeConfig).toBe("function");
  });
});
