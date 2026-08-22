import {
  extractReplayHeaders,
  hydratePagedSnapshot,
  isOfflineQueueableRequest,
} from "@vireocodedev/starter-sqlite/offline";

export async function runOfflineUtilitiesExample() {
  const persisted: Array<{ id: string; name: string }> = [];
  const hydration = await hydratePagedSnapshot({
    fetchPage: async page => ({
      content: page === 0 ? [{ id: "1", name: "Northstar" }] : [{ id: "2", name: "Atlas" }],
      totalPages: 2,
    }),
    mapRow: row => row,
    replaceSnapshot: async rows => {
      persisted.push(...rows);
    },
  });

  return {
    hydration,
    persisted,
    queueable: isOfflineQueueableRequest({ method: "PATCH", url: "/api/customers/1" }),
    searchExcluded: isOfflineQueueableRequest({ method: "POST", url: "/api/customers/search" }),
    replayHeaders: extractReplayHeaders({
      "idempotency-key": "request-42",
      authorization: "Bearer secret",
      "content-type": "application/json",
    }),
  };
}
