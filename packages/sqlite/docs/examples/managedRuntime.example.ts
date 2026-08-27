import { createManagedSqliteRuntime, type WorkerRequest, type WorkerResponse } from "@vireocodedev/sqlite";

class DemoWorker extends EventTarget {
  terminated = false;

  postMessage(request: WorkerRequest) {
    const response: WorkerResponse = {
      id: request.id,
      ok: true,
      result: request.type === "init" ? null : `handled:${request.type}`,
    };
    queueMicrotask(() => this.dispatchEvent(new MessageEvent("message", { data: response })));
  }

  terminate() {
    this.terminated = true;
  }
}

export async function runManagedRuntimeExample() {
  const workers: DemoWorker[] = [];
  const runtime = createManagedSqliteRuntime({
    workerFactory: () => {
      const worker = new DemoWorker();
      workers.push(worker);
      return worker as unknown as Worker;
    },
  });

  await Promise.all([runtime.ensureInitialized(), runtime.ensureInitialized()]);
  const firstResult = await runtime.send<string>({ type: "listCustomers" });
  runtime.reset();
  await runtime.ensureInitialized();

  const output = {
    firstResult,
    workersCreated: workers.length,
    firstWorkerTerminated: workers[0].terminated,
  };
  runtime.dispose();
  return output;
}
