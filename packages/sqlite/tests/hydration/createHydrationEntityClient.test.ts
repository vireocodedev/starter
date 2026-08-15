import { createHydrationEntityClient } from "@/hydration/createHydrationEntityClient";
import { describe, expect, it, vi } from "vitest";

const buyerState = {
  entityKey: "buyer",
  appliedRevision: 2,
  isStale: false,
  lastHydratedAt: 10,
  lastRowCount: 3,
  lastError: null,
};

describe("createHydrationEntityClient", () => {
  it("owns isolated fallback metadata and unregisters it on disposal", async () => {
    const unregister = vi.fn();
    const client = createHydrationEntityClient({
      runtime: { shouldUseInMemoryFallback: () => true, registerInMemoryStore: () => unregister },
      transport: { sendWorkerRequest: vi.fn() },
    });

    await client.upsert(buyerState);
    expect(await client.list()).toEqual([buyerState]);
    client.dispose();
    expect(unregister).toHaveBeenCalledOnce();
  });

  it("binds list and upsert to the configured worker transport", async () => {
    const sendWorkerRequest = vi.fn().mockResolvedValueOnce([buyerState]).mockResolvedValueOnce(null);
    const client = createHydrationEntityClient({
      runtime: { shouldUseInMemoryFallback: () => false, registerInMemoryStore: () => vi.fn() },
      transport: { sendWorkerRequest },
    });

    expect(await client.list()).toEqual([buyerState]);
    await client.upsert(buyerState);
    expect(sendWorkerRequest).toHaveBeenNthCalledWith(1, { type: "listHydrationEntityStates" });
    expect(sendWorkerRequest).toHaveBeenNthCalledWith(2, { type: "upsertHydrationEntityState", state: buyerState });
  });
});
