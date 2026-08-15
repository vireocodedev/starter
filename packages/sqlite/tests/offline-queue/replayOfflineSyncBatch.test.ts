import { replayOfflineSyncBatch } from "@/offline-queue/replayOfflineSyncBatch";
import { describe, expect, it, vi } from "vitest";

describe("replayOfflineSyncBatch", () => {
  it("deletes successes while retaining missing and permanently rejected results", async () => {
    const deleteSuccessful = vi.fn().mockResolvedValue(undefined);
    const markPermanentlyFailed = vi.fn().mockResolvedValue(undefined);
    const markRetryable = vi.fn().mockResolvedValue(undefined);
    const cleanupSuccessfulCommands = vi.fn().mockResolvedValue(undefined);
    const refreshStatus = vi.fn().mockResolvedValue(undefined);
    const commands = ["ok", "missing", "rejected"].map((commandId, createdAt) => ({
      commandId,
      method: "POST",
      url: "/api/product",
      body: null,
      headers: {},
      createdAt,
    }));

    const count = await replayOfflineSyncBatch({
      batchSize: 10,
      maxAttempts: 5,
      dependencies: {
        getBatch: vi.fn().mockResolvedValue(commands),
        sendBatch: vi.fn().mockResolvedValue({
          accepted: 1,
          failed: 1,
          results: [
            { commandId: "ok", success: true, status: 200, error: null, reason: "APPLIED" },
            { commandId: "rejected", success: false, status: 400, error: "invalid", reason: "REJECTED" },
          ],
        }),
        cleanupSuccessfulCommands,
        deleteSuccessful,
        markPermanentlyFailed,
        markRetryable,
        refreshStatus,
      },
    });

    expect(count).toBe(1);
    expect(cleanupSuccessfulCommands).toHaveBeenCalledWith([commands[0]]);
    expect(deleteSuccessful).toHaveBeenCalledWith(["ok"]);
    expect(markPermanentlyFailed).toHaveBeenCalledWith(["rejected"], "invalid");
    expect(markRetryable).toHaveBeenCalledWith(["missing"], null, 5);
    expect(refreshStatus).toHaveBeenCalledOnce();
  });
});
