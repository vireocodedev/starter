import { createOfflineQueueClient } from "@/offline-queue/createOfflineQueueClient";
import { describe, expect, it, vi } from "vitest";

function command(commandId: string, createdAt: number) {
  return { commandId, method: "POST", url: "/api/product", body: null, headers: {}, createdAt };
}

describe("createOfflineQueueClient", () => {
  it("owns isolated fallback state with retry and permanent-failure semantics", async () => {
    const stores: Array<{ clear: () => void }> = [];
    const unregister = vi.fn();
    const client = createOfflineQueueClient({
      runtime: {
        shouldUseInMemoryFallback: () => true,
        registerInMemoryStore: value => {
          stores.push(value);
          return unregister;
        },
      },
      transport: { sendWorkerRequest: vi.fn() },
    });

    await client.enqueue(command("later", 2));
    await client.enqueue(command("first", 1));
    expect((await client.getBatch(10)).map(item => item.commandId)).toEqual(["first", "later"]);

    await client.markRetryable(["first"], "again", 2);
    await client.markRetryable(["first"], "exhausted", 2);
    expect(await client.getStatusCounts()).toEqual({ pending: 1, permanentlyFailed: 1 });
    expect((await client.getBatch(10)).map(item => item.commandId)).toEqual(["later"]);

    stores[0]?.clear();
    expect(await client.getSize()).toBe(0);
    client.dispose();
    expect(unregister).toHaveBeenCalledOnce();
  });

  it("uses one runtime-bound worker protocol when fallback is disabled", async () => {
    const sendWorkerRequest = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce([]);
    const client = createOfflineQueueClient({
      runtime: { shouldUseInMemoryFallback: () => false, registerInMemoryStore: () => vi.fn() },
      transport: { sendWorkerRequest },
    });

    await client.enqueue(command("one", 1));
    await client.getBatch(5);

    expect(sendWorkerRequest).toHaveBeenNthCalledWith(1, { type: "enqueue", command: command("one", 1) });
    expect(sendWorkerRequest).toHaveBeenNthCalledWith(2, { type: "getPendingBatch", batchSize: 5 });
  });
});
