import { createOfflineQueueCapture, replayOfflineSyncBatch } from "@vireocodedev/sqlite";
import { type OfflineSyncCommand } from "@vireocodedev/sqlite/offline";

export const ORDER_QUANTITY_REPLAY_CONTRACT = Object.freeze({
  commandId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  method: "PATCH",
  url: "/api/orders/0f8fad5b-d9cb-469f-a165-70867728950e/quantity",
  body: Object.freeze({ quantity: 3 }),
});

type ChangeQuantityRequest = {
  method: typeof ORDER_QUANTITY_REPLAY_CONTRACT.method;
  url: typeof ORDER_QUANTITY_REPLAY_CONTRACT.url;
  body: typeof ORDER_QUANTITY_REPLAY_CONTRACT.body;
  headers: Record<string, string>;
};

/**
 * An opt-in command shape paired with OfflineReplayConfigurationExample on the
 * JVM. Applications still own admission, durable storage, idempotency, and
 * conflict/recovery UX; this example does not enable offline CRUD.
 */
export async function runOrderQuantityOfflineReplayExample() {
  const queued: OfflineSyncCommand[] = [];
  const events: string[] = [];
  const capture = createOfflineQueueCapture<ChangeQuantityRequest>({
    resolveUrl: request => request.url,
    createCommandId: () => ORDER_QUANTITY_REPLAY_CONTRACT.commandId,
    now: () => 1,
    enqueue: async command => {
      queued.push(command);
    },
    markEnqueued: () => {
      events.push("queued");
    },
    refreshStatus: async () => {
      events.push("refresh");
    },
  });

  const command = await capture({ ...ORDER_QUANTITY_REPLAY_CONTRACT, headers: {} });
  const applied = await replayOfflineSyncBatch({
    batchSize: 10,
    maxAttempts: 3,
    dependencies: {
      getBatch: async () => queued,
      sendBatch: async sent => ({
        accepted: 1,
        failed: 0,
        results: [{ commandId: sent[0].commandId, success: true, status: 204, error: null, reason: "APPLIED" }],
      }),
      cleanupSuccessfulCommands: async successful => {
        events.push(`cleanup:${successful.map(item => item.commandId).join(",")}`);
      },
      deleteSuccessful: async ids => {
        events.push(`delete:${ids.join(",")}`);
      },
      markPermanentlyFailed: async () => undefined,
      markRetryable: async () => undefined,
      refreshStatus: async () => {
        events.push("replay-refresh");
      },
    },
  });

  return { command, applied, events };
}
