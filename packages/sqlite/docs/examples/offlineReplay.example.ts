import { replayOfflineSyncBatch } from "@vireocodedev/sqlite";
import { type OfflineSyncCommand } from "@vireocodedev/sqlite/offline";

const commands: OfflineSyncCommand[] = [
  {
    commandId: "create-1",
    method: "POST",
    url: "/api/customers",
    body: { name: "Northstar" },
    headers: {},
    createdAt: 1,
  },
  {
    commandId: "update-2",
    method: "PATCH",
    url: "/api/customers/2",
    body: { active: true },
    headers: {},
    createdAt: 2,
  },
];

export async function runOfflineReplayExample() {
  const events: string[] = [];
  const applied = await replayOfflineSyncBatch({
    batchSize: 20,
    maxAttempts: 3,
    dependencies: {
      getBatch: async () => commands,
      sendBatch: async sent => ({
        accepted: 1,
        failed: 1,
        results: [
          { commandId: sent[0].commandId, success: true, status: 200, error: null, reason: "APPLIED" },
          { commandId: sent[1].commandId, success: false, status: 503, error: "Unavailable", reason: "RETRYABLE" },
        ],
      }),
      cleanupSuccessfulCommands: async successful => {
        events.push(`cleanup:${successful.map(item => item.commandId)}`);
      },
      deleteSuccessful: async ids => {
        events.push(`delete:${ids}`);
      },
      markPermanentlyFailed: async ids => {
        events.push(`permanent:${ids}`);
      },
      markRetryable: async ids => {
        events.push(`retry:${ids}`);
      },
      refreshStatus: async () => {
        events.push("refresh");
      },
    },
  });

  return { applied, events };
}
