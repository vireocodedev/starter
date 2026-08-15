import { type WorkerRequestInput, type WorkerResponseResult } from "@/core/sqliteWorkerProtocol";

export type SqliteTransportRuntime = {
  shouldUseInMemoryFallback: () => boolean;
  ensureInitialized: () => Promise<void>;
  send: <T extends WorkerResponseResult>(payload: WorkerRequestInput) => Promise<T>;
};

export type SqliteTransport = {
  sendRequest: <TResponse = unknown>(type: string, payload?: Record<string, unknown>) => Promise<TResponse>;
  sendWorkerRequest: <T extends WorkerResponseResult>(
    payload: { type: string } & Record<string, unknown>,
  ) => Promise<T>;
};

export type CreateSqliteTransportConfig = {
  runtime: SqliteTransportRuntime;
  createUnavailableError?: (requestType: string) => Error;
};

export function createSqliteTransport({
  runtime,
  createUnavailableError,
}: CreateSqliteTransportConfig): SqliteTransport {
  const unavailableError =
    createUnavailableError ??
    (requestType => new Error(`SQLite request '${requestType}' is unavailable in this runtime.`));

  return {
    async sendRequest<TResponse = unknown>(type: string, payload?: Record<string, unknown>): Promise<TResponse> {
      if (runtime.shouldUseInMemoryFallback()) throw unavailableError(type);
      await runtime.ensureInitialized();
      return (await runtime.send({ type, ...(payload ?? {}) })) as TResponse;
    },
    async sendWorkerRequest<T extends WorkerResponseResult>(
      payload: { type: string } & Record<string, unknown>,
    ): Promise<T> {
      await runtime.ensureInitialized();
      return await runtime.send<T>(payload);
    },
  };
}
