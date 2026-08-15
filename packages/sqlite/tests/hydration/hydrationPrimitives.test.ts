import { createHydrationContributorRegistry } from "@/hydration/createHydrationContributorRegistry";
import { createHydrationGate } from "@/hydration/createHydrationGate";
import { createHydrationRequestQueue } from "@/hydration/createHydrationRequestQueue";
import { createHydrationStatus } from "@/hydration/createHydrationStatus";
import { createLocalReflectionQueue } from "@/hydration/createLocalReflectionQueue";
import { describe, expect, it, vi } from "vitest";

describe("hydration primitives", () => {
  it("registers contributors by key with deterministic replacement and ordering", () => {
    const registry = createHydrationContributorRegistry();
    const firstBuyer = { key: "buyer", hydrate: vi.fn() };
    const latestBuyer = { key: "buyer", hydrate: vi.fn() };
    const product = { key: "product", hydrate: vi.fn() };

    registry.register([product, firstBuyer]);
    registry.register([latestBuyer]);

    expect(registry.list()).toEqual([latestBuyer, product]);
  });

  it("publishes framework-neutral entity status transitions", () => {
    const status = createHydrationStatus({ now: () => 42 });
    const listener = vi.fn();
    status.subscribe(listener);

    status.registerEntities(["product", "buyer"]);
    status.markRunning(true);
    status.markEntityRunning("buyer");
    status.markEntitySuccess("buyer", 3);

    expect(status.getSnapshot()).toEqual({
      running: true,
      entities: [
        {
          key: "buyer",
          state: "success",
          lastAttemptAt: 42,
          lastSuccessAt: 42,
          rowCount: 3,
          errorMessage: null,
        },
        {
          key: "product",
          state: "idle",
          lastAttemptAt: null,
          lastSuccessAt: null,
          rowCount: null,
          errorMessage: null,
        },
      ],
    });
    expect(listener).toHaveBeenCalledTimes(4);
  });

  it("owns gate timestamps, readiness, errors, retries and reset semantics", () => {
    const gate = createHydrationGate({ now: () => 50 });
    gate.start();
    gate.markDataReady();
    gate.setErrorMessage("temporary");
    gate.requestRetry();
    gate.finish();

    expect(gate.getSnapshot()).toEqual({
      phase: "finished",
      startedAt: 50,
      dataReady: true,
      errorMessage: "temporary",
      retryRequestTick: 1,
    });

    gate.reset();
    expect(gate.getSnapshot()).toEqual({
      phase: "idle",
      startedAt: null,
      dataReady: false,
      errorMessage: "temporary",
      retryRequestTick: 1,
    });
  });

  it("batches forced requests and settles each request by its own failed keys", async () => {
    const onRequestQueued = vi.fn();
    const requests = createHydrationRequestQueue({ onRequestQueued });
    const buyer = requests.request([" buyer ", ""]);
    const product = requests.request(["product"]);
    const batch = requests.consume();

    expect(batch.forcedKeys).toEqual(new Set(["buyer", "product"]));
    requests.settle(batch, new Set(["product"]));

    await expect(buyer).resolves.toBeUndefined();
    await expect(product).rejects.toThrow("Hydration failed for: product.");
    expect(onRequestQueued).toHaveBeenCalledTimes(2);
  });

  it("tracks background reflections until every entity operation settles", async () => {
    let release!: () => void;
    const operation = new Promise<void>(resolve => {
      release = resolve;
    });
    const counts: number[] = [];
    const queue = createLocalReflectionQueue({
      runEntityExclusive: async (_key, run) => await run(),
      onPendingCountChange: count => counts.push(count),
    });

    queue.enqueue("buyer", () => operation);
    expect(queue.getPendingCount()).toBe(1);
    const idle = queue.awaitIdle();
    release();
    await idle;

    expect(queue.getPendingCount()).toBe(0);
    expect(counts).toEqual([1, 0]);
  });
});
