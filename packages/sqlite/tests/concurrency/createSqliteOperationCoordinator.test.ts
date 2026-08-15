import { createSqliteOperationCoordinator } from "@/concurrency/createSqliteOperationCoordinator";
import { describe, expect, it, vi } from "vitest";

describe("createSqliteOperationCoordinator", () => {
  it("keeps local operation queues isolated between coordinator instances", async () => {
    const first = createSqliteOperationCoordinator({ lockName: "first" });
    const second = createSqliteOperationCoordinator({ lockName: "second" });
    const calls: string[] = [];
    let releaseFirst!: () => void;
    const blocked = new Promise<void>(resolve => {
      releaseFirst = resolve;
    });

    const firstOperation = first.runDatabaseExclusive(async () => {
      calls.push("first:start");
      await blocked;
      calls.push("first:end");
    });
    const secondOperation = second.runDatabaseExclusive(async () => {
      calls.push("second");
    });

    await vi.waitFor(() => expect(calls).toEqual(["first:start", "second"]));
    releaseFirst();
    await Promise.all([firstOperation, secondOperation]);
  });
});
