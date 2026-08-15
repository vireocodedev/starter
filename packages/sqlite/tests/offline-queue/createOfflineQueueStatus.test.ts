import { createOfflineQueueStatus } from "@/offline-queue/createOfflineQueueStatus";
import { describe, expect, it, vi } from "vitest";

describe("createOfflineQueueStatus", () => {
  it("publishes enqueue and persisted-count changes without coupling to a signal library", async () => {
    const readStatusCounts = vi.fn().mockResolvedValue({ pending: 2, permanentlyFailed: 1 });
    const status = createOfflineQueueStatus({ readStatusCounts });
    const listener = vi.fn();
    status.subscribe(listener);

    status.markEnqueued();
    await status.refresh();

    expect(status.getSnapshot()).toEqual({ pending: 2, permanentlyFailed: 1, enqueueTick: 1 });
    expect(listener).toHaveBeenCalledTimes(2);

    status.resetCounts();
    expect(status.getSnapshot()).toEqual({ pending: 0, permanentlyFailed: 0, enqueueTick: 1 });
  });

  it("keeps refresh failures non-blocking and optionally reports them", async () => {
    const error = new Error("unavailable");
    const onReadError = vi.fn();
    const status = createOfflineQueueStatus({ readStatusCounts: vi.fn().mockRejectedValue(error), onReadError });

    await expect(status.refresh()).resolves.toBeUndefined();
    expect(onReadError).toHaveBeenCalledWith(error);
    expect(status.getSnapshot()).toEqual({ pending: 0, permanentlyFailed: 0, enqueueTick: 0 });
  });
});
