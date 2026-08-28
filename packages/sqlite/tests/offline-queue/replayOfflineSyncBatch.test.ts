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

  it.each([
    {
      label: "unknown command",
      response: {
        accepted: 1,
        failed: 0,
        results: [{ commandId: "other", success: true, status: 200, error: null }],
      },
      message: 'unknown command ID "other"',
    },
    {
      label: "duplicate command",
      response: {
        accepted: 2,
        failed: 0,
        results: [
          { commandId: "queued", success: true, status: 200, error: null },
          { commandId: "queued", success: true, status: 200, error: null },
        ],
      },
      message: 'duplicate command ID "queued"',
    },
    {
      label: "inconsistent counts",
      response: {
        accepted: 0,
        failed: 0,
        results: [{ commandId: "queued", success: true, status: 200, error: null }],
      },
      message: "counts do not match",
    },
  ])("refuses a malformed $label response before mutating the queue", async ({ response, message }) => {
    const mutation = vi.fn().mockResolvedValue(undefined);
    const command = {
      commandId: "queued",
      method: "POST",
      url: "/api/product",
      body: null,
      headers: {},
      createdAt: 1,
    };

    await expect(
      replayOfflineSyncBatch({
        batchSize: 1,
        maxAttempts: 3,
        dependencies: {
          getBatch: vi.fn().mockResolvedValue([command]),
          sendBatch: vi.fn().mockResolvedValue(response),
          cleanupSuccessfulCommands: mutation,
          deleteSuccessful: mutation,
          markPermanentlyFailed: mutation,
          markRetryable: mutation,
          refreshStatus: mutation,
        },
      }),
    ).rejects.toThrow(message);

    expect(mutation).not.toHaveBeenCalled();
  });
});
