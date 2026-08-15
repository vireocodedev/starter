import { createManagedSqliteRuntime } from "@/runtime/createManagedSqliteRuntime";
import { describe, expect, it, vi } from "vitest";

type WorkerListener = (event: MessageEvent & ErrorEvent) => void;

class FakeWorker {
  readonly messages: Array<{ id: number; type: string }> = [];
  readonly terminate = vi.fn();
  private readonly listeners = new Map<string, WorkerListener[]>();

  addEventListener(type: string, listener: WorkerListener): void {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  postMessage(message: { id: number; type: string }): void {
    this.messages.push(message);
  }

  respond(id: number, result: unknown): void {
    this.emit("message", { data: { id, ok: true, result } });
  }

  private emit(type: string, event: unknown): void {
    for (const listener of this.listeners.get(type) ?? []) listener(event as MessageEvent & ErrorEvent);
  }
}

function createHarness() {
  const workers: FakeWorker[] = [];
  const runtime = createManagedSqliteRuntime({
    workerFactory: () => {
      const worker = new FakeWorker();
      workers.push(worker);
      return worker as unknown as Worker;
    },
  });
  return { runtime, workers };
}

describe("createManagedSqliteRuntime", () => {
  it("single-flights initialization and reuses the initialized worker", async () => {
    const { runtime, workers } = createHarness();
    const first = runtime.ensureInitialized();
    const second = runtime.ensureInitialized();

    expect(workers).toHaveLength(1);
    expect(workers[0].messages).toEqual([{ id: 1, type: "init" }]);
    workers[0].respond(1, null);
    await Promise.all([first, second]);

    await runtime.ensureInitialized();
    expect(workers[0].messages).toHaveLength(1);
  });

  it("rejects pending work on reset and creates a fresh worker for later requests", async () => {
    const { runtime, workers } = createHarness();
    const pending = runtime.send({ type: "list" });
    const rejected = expect(pending).rejects.toThrow("SQLite runtime was reset.");

    runtime.reset();
    await rejected;
    expect(workers[0].terminate).toHaveBeenCalledOnce();

    const next = runtime.send<string>({ type: "list" });
    expect(workers).toHaveLength(2);
    workers[1].respond(2, "fresh");
    await expect(next).resolves.toBe("fresh");
  });

  it("keeps fallback stores isolated between configured runtime instances", () => {
    const first = createHarness().runtime;
    const second = createHarness().runtime;
    const firstStore = { clear: vi.fn() };
    const secondStore = { clear: vi.fn() };
    first.registerInMemoryStore(firstStore);
    second.registerInMemoryStore(secondStore);

    first.clearInMemoryStores();

    expect(firstStore.clear).toHaveBeenCalledOnce();
    expect(secondStore.clear).not.toHaveBeenCalled();
  });

  it("disposes idempotently and refuses to create another worker", async () => {
    const { runtime, workers } = createHarness();
    runtime.dispose();
    runtime.dispose();

    await expect(runtime.send({ type: "list" })).rejects.toThrow("SQLite runtime has been disposed.");
    expect(workers).toHaveLength(0);
  });
});
