import { createOfflineQueueCapture, type OfflineQueueCaptureRequest } from "@/offline-queue/createOfflineQueueCapture";
import { describe, expect, it, vi } from "vitest";

describe("createOfflineQueueCapture", () => {
  it("builds a replay-safe command through injected transport policy", async () => {
    const enqueue = vi.fn().mockResolvedValue(undefined);
    const markEnqueued = vi.fn();
    const refreshStatus = vi.fn().mockResolvedValue(undefined);
    const capture = createOfflineQueueCapture<OfflineQueueCaptureRequest & { path: string }>({
      resolveUrl: request => request.path,
      createCommandId: () => "command-1",
      now: () => 42,
      enqueue,
      markEnqueued,
      refreshStatus,
    });

    const command = await capture({
      path: "/api/product?draft=true",
      method: "post",
      body: { description: "Leather" },
      headers: { "X-Offline-Temp-Id": -4, Authorization: "secret" },
    });

    expect(command).toEqual({
      commandId: "command-1",
      method: "POST",
      url: "/api/product?draft=true",
      body: { description: "Leather" },
      headers: { "X-Offline-Temp-Id": "-4" },
      createdAt: 42,
    });
    expect(enqueue).toHaveBeenCalledWith(command);
    expect(markEnqueued).toHaveBeenCalledOnce();
    expect(refreshStatus).toHaveBeenCalledOnce();
  });

  it("does not publish an enqueue when persistence fails", async () => {
    const markEnqueued = vi.fn();
    const refreshStatus = vi.fn();
    const capture = createOfflineQueueCapture({
      resolveUrl: () => "/api/product",
      createCommandId: () => "command-1",
      now: () => 1,
      enqueue: vi.fn().mockRejectedValue(new Error("write failed")),
      markEnqueued,
      refreshStatus,
    });

    await expect(capture({})).rejects.toThrow("write failed");
    expect(markEnqueued).not.toHaveBeenCalled();
    expect(refreshStatus).not.toHaveBeenCalled();
  });
});
