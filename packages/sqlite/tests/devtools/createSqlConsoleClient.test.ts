import { createSqlConsoleClient } from "@/devtools/createSqlConsoleClient";
import { type WorkerResponseResult } from "@/index";
import { describe, expect, it, vi } from "vitest";

describe("createSqlConsoleClient", () => {
  it("deduplicates equivalent in-flight paged queries within one client instance", async () => {
    let resolveQuery!: (value: { columns: string[]; rows: unknown[][]; totalElements: number }) => void;
    const query = new Promise<{ columns: string[]; rows: unknown[][]; totalElements: number }>(resolve => {
      resolveQuery = resolve;
    });
    const sendWorkerRequest = vi.fn(() => query);
    const client = createSqlConsoleClient({
      runtime: { shouldUseInMemoryFallback: () => false },
      transport: {
        sendWorkerRequest: async <T extends WorkerResponseResult>() => (await sendWorkerRequest()) as T,
      },
      now: () => 42,
    });
    const request = {
      selectSql: "SELECT id",
      fromSql: "FROM item",
      whereSql: "",
      orderBySql: "ORDER BY id",
      limit: 10,
      offset: 0,
    };

    const first = client.executePagedQuery(request);
    const second = client.executePagedQuery({ ...request });
    expect(sendWorkerRequest).toHaveBeenCalledOnce();

    resolveQuery({ columns: ["id"], rows: [[1]], totalElements: 1 });
    await expect(Promise.all([first, second])).resolves.toEqual([
      { columns: ["id"], rows: [[1]], totalElements: 1 },
      { columns: ["id"], rows: [[1]], totalElements: 1 },
    ]);
  });

  it("keeps deduplication state isolated between client instances", async () => {
    const sendWorkerRequest = vi.fn(async () => ({ columns: [], rows: [], totalElements: 0 }));
    const config = {
      runtime: { shouldUseInMemoryFallback: () => false },
      transport: {
        sendWorkerRequest: async <T extends WorkerResponseResult>() => (await sendWorkerRequest()) as T,
      },
    };
    const request = { selectSql: "SELECT 1", fromSql: "", whereSql: "", orderBySql: "", limit: 1, offset: 0 };

    await Promise.all([
      createSqlConsoleClient(config).executePagedQuery(request),
      createSqlConsoleClient(config).executePagedQuery(request),
    ]);

    expect(sendWorkerRequest).toHaveBeenCalledTimes(2);
  });
});
