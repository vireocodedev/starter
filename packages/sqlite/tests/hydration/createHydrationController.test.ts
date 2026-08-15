import { createHydrationController, type HydrationControllerEvents } from "@/hydration/createHydrationController";
import { createHydrationRequestQueue } from "@/hydration/createHydrationRequestQueue";
import { type SqliteHydrationEntityStateRecord } from "@/index";
import { afterEach, describe, expect, it, vi } from "vitest";

function events(): HydrationControllerEvents {
  return {
    registerEntities: vi.fn(),
    markRunning: vi.fn(),
    markEntityRunning: vi.fn(),
    markEntitySuccess: vi.fn(),
    markEntityError: vi.fn(),
    startGate: vi.fn(),
    resetGate: vi.fn(),
    finishGate: vi.fn(),
    markDataReady: vi.fn(),
    setErrorMessage: vi.fn(),
  };
}

function createHarness(
  overrides: {
    hydrate?: () => Promise<{ rowCount: number }>;
    list?: () => Promise<SqliteHydrationEntityStateRecord[]>;
    fetchRemoteVersions?: () => Promise<{ versions: Array<{ entity: string; revision: number }> }>;
  } = {},
) {
  const controllerEvents = events();
  const requests = createHydrationRequestQueue();
  const upsert = vi.fn().mockResolvedValue(undefined);
  const hydrate = vi.fn(overrides.hydrate ?? (async () => ({ rowCount: 4 })));
  const controller = createHydrationController({
    getContributors: () => [{ key: "buyer", hydrate }],
    entityStateClient: {
      list: vi.fn(overrides.list ?? (async () => [])),
      upsert,
    },
    requests,
    runHydrationExclusive: async operation => await operation(new AbortController().signal, {}),
    runEntityExclusive: async (_key, operation) => await operation(),
    fetchRemoteVersions:
      overrides.fetchRemoteVersions ?? (async () => ({ versions: [{ entity: "buyer", revision: 2 }] })),
    events: controllerEvents,
    remoteVersionsTimeoutMs: 1_000,
    entityTimeoutMs: () => 1_000,
    retryBaseMs: 100,
    retryMaxMs: 1_000,
    timestampNow: () => 50,
  });
  return { controller, controllerEvents, requests, upsert, hydrate };
}

describe("createHydrationController", () => {
  afterEach(() => vi.useRealTimers());

  it("skips current entities and marks validated data ready", async () => {
    const current = {
      entityKey: "buyer",
      appliedRevision: 2,
      isStale: false,
      lastHydratedAt: 1,
      lastRowCount: 4,
      lastError: null,
    };
    const harness = createHarness({ list: async () => [current] });

    await harness.controller.run();

    expect(harness.hydrate).not.toHaveBeenCalled();
    expect(harness.controllerEvents.markEntitySuccess).toHaveBeenCalledWith("buyer", 4);
    expect(harness.controllerEvents.markDataReady).toHaveBeenCalledOnce();
    expect(harness.controllerEvents.finishGate).toHaveBeenCalledOnce();
  });

  it("forces a current entity, preserves the highest revision and settles its request", async () => {
    const current = {
      entityKey: "buyer",
      appliedRevision: 3,
      isStale: false,
      lastHydratedAt: 1,
      lastRowCount: 2,
      lastError: null,
    };
    const harness = createHarness({ list: async () => [current] });
    const request = harness.requests.request(["buyer"]);

    await harness.controller.run();
    await expect(request).resolves.toBeUndefined();

    expect(harness.hydrate).toHaveBeenCalledOnce();
    expect(harness.upsert).toHaveBeenCalledWith({
      entityKey: "buyer",
      appliedRevision: 3,
      isStale: false,
      lastHydratedAt: 50,
      lastRowCount: 4,
      lastError: null,
    });
  });

  it("persists entity failures, rejects matching requests and schedules a retry", async () => {
    vi.useFakeTimers();
    const harness = createHarness({ hydrate: async () => await Promise.reject(new Error("temporary")) });
    const request = harness.requests.request(["buyer"]);

    await harness.controller.run();
    await expect(request).rejects.toThrow("Hydration failed for: buyer.");
    expect(harness.upsert).toHaveBeenCalledWith(expect.objectContaining({ isStale: true, lastError: "temporary" }));
    expect(harness.controllerEvents.markDataReady).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(100);
    expect(harness.controllerEvents.resetGate).toHaveBeenCalledOnce();
  });

  it("hydrates as stale and retries when remote revision validation is unavailable", async () => {
    vi.useFakeTimers();
    const harness = createHarness({
      fetchRemoteVersions: async () => await Promise.reject(new Error("offline")),
    });

    await harness.controller.run();
    expect(harness.upsert).toHaveBeenCalledWith(expect.objectContaining({ isStale: true, appliedRevision: 0 }));
    expect(harness.controllerEvents.markDataReady).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(100);
    expect(harness.controllerEvents.resetGate).toHaveBeenCalledOnce();
  });
});
