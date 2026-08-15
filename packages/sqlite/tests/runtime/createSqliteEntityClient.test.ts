import { createSqliteEntityClient } from "@/runtime/createSqliteEntityClient";
import { beforeEach, describe, expect, it, vi } from "vitest";

const runtime = vi.hoisted(() => ({
  useFallback: true,
  registerStore: vi.fn(),
  sendRequest: vi.fn(),
}));

type RecordValue = { id: number; name: string };

function createClient() {
  return createSqliteEntityClient<RecordValue, number>({
    runtime: {
      registerInMemoryStore: runtime.registerStore,
      shouldUseInMemoryFallback: () => runtime.useFallback,
    },
    transport: { sendWorkerRequest: runtime.sendRequest },
    getKey: record => record.id,
    compare: (left, right) => left.id - right.id,
    requests: {
      replace: { type: "replaceRecords", payloadKey: "records" },
      upsert: { type: "upsertRecord", payloadKey: "record" },
      list: { type: "listRecords" },
      delete: { type: "deleteRecords", payloadKey: "recordIds" },
    },
  });
}

describe("createSqliteEntityClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runtime.useFallback = true;
  });

  it("provides sorted replace, upsert and delete behavior through the in-memory fallback", async () => {
    const client = createClient();

    await client.replace([
      { id: 2, name: "second" },
      { id: 1, name: "first" },
    ]);
    await client.upsert({ id: 3, name: "third" });
    await client.delete([2]);

    expect(await client.list()).toEqual([
      { id: 1, name: "first" },
      { id: 3, name: "third" },
    ]);
    expect(runtime.registerStore).toHaveBeenCalledOnce();
    expect(runtime.sendRequest).not.toHaveBeenCalled();
  });

  it("maps configured request names and payload keys to the SQLite worker transport", async () => {
    runtime.useFallback = false;
    runtime.sendRequest.mockImplementation(async request =>
      request.type === "listRecords" ? [{ id: 4, name: "worker" }] : null,
    );
    const client = createClient();
    const record = { id: 4, name: "worker" };

    await client.replace([record]);
    await client.upsert(record);
    expect(await client.list()).toEqual([record]);
    await client.delete([4]);

    expect(runtime.sendRequest.mock.calls.map(([request]) => request)).toEqual([
      { type: "replaceRecords", records: [record] },
      { type: "upsertRecord", record },
      { type: "listRecords" },
      { type: "deleteRecords", recordIds: [4] },
    ]);
  });
});
