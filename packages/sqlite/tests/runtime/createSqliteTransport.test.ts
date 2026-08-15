import { createSqliteTransport } from "@/runtime/createSqliteTransport";
import { type WorkerRequestInput, type WorkerResponseResult } from "@/index";
import { describe, expect, it, vi } from "vitest";

describe("createSqliteTransport", () => {
  it("initializes before forwarding worker requests", async () => {
    const calls: string[] = [];
    const send = vi.fn(async (payload: WorkerRequestInput) => {
      calls.push(String(payload.type));
      return { ok: true };
    });
    const transport = createSqliteTransport({
      runtime: {
        shouldUseInMemoryFallback: () => false,
        ensureInitialized: vi.fn(async () => {
          calls.push("initialize");
        }),
        send: async <T extends WorkerResponseResult>(payload: WorkerRequestInput) => (await send(payload)) as T,
      },
    });

    await expect(transport.sendRequest("search", { limit: 10 })).resolves.toEqual({ ok: true });
    expect(calls).toEqual(["initialize", "search"]);
  });

  it("rejects public requests in fallback mode without touching the worker", async () => {
    const ensureInitialized = vi.fn();
    const transport = createSqliteTransport({
      runtime: {
        shouldUseInMemoryFallback: () => true,
        ensureInitialized,
        send: async <T extends WorkerResponseResult>() => undefined as T,
      },
    });

    await expect(transport.sendRequest("search")).rejects.toThrow("SQLite request 'search' is unavailable");
    expect(ensureInitialized).not.toHaveBeenCalled();
  });
});
