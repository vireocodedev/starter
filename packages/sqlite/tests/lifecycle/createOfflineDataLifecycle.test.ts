import { createOfflineDataLifecycle } from "@/lifecycle/createOfflineDataLifecycle";
import { describe, expect, it } from "vitest";

function createHarness(initialOwner: string | null = null) {
  let owner = initialOwner;
  const calls: string[] = [];
  const lifecycle = createOfflineDataLifecycle({
    readOwner: () => owner,
    persistOwner: next => {
      calls.push(`persist:${next}`);
      owner = next;
    },
    resolveDatabaseFileName: next => `db-${next}.sqlite`,
    abortHydration: () => calls.push("abort"),
    awaitHydrationIdle: async () => void calls.push("hydration-idle"),
    awaitLocalReflectionIdle: async () => void calls.push("reflection-idle"),
    awaitQueueFlushIdle: async () => void calls.push("queue-idle"),
    resetHydrationGate: () => calls.push("reset-gate"),
    resetHydrationStatus: () => calls.push("reset-hydration"),
    resetQueueStatus: () => calls.push("reset-queue"),
    resetRuntime: () => calls.push("reset-runtime"),
    clearInMemoryStores: () => calls.push("clear-memory"),
    deleteDatabaseFiles: async fileName => void calls.push(`delete:${fileName}`),
  });
  return { lifecycle, calls, readOwner: () => owner };
}

describe("createOfflineDataLifecycle", () => {
  it("quiesces all writers before deleting the selected database", async () => {
    const { lifecycle, calls } = createHarness("bruno");

    await lifecycle.purge();

    expect(calls).toEqual([
      "abort",
      "hydration-idle",
      "reflection-idle",
      "queue-idle",
      "reset-gate",
      "reset-hydration",
      "reset-queue",
      "reset-runtime",
      "clear-memory",
      "delete:db-bruno.sqlite",
    ]);
  });

  it("single-flights concurrent account switches", async () => {
    const { lifecycle, calls, readOwner } = createHarness("bruno");

    await Promise.all([lifecycle.ensureOwnedBy("marta"), lifecycle.ensureOwnedBy("marta")]);

    expect(readOwner()).toBe("marta");
    expect(calls.filter(call => call === "reset-runtime")).toHaveLength(1);
    expect(calls.filter(call => call === "persist:marta")).toHaveLength(1);
  });
});
