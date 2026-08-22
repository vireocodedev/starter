import { type SqliteTransport } from "../runtime/createSqliteTransport";
import { type SqlExecutionResult, type SqlPagedQueryRequest, type SqlPagedQueryResult } from "../runtime/contracts";

export type SqlConsoleClient = {
  executeScript: (script: string) => Promise<SqlExecutionResult>;
  executePagedQuery: (request: SqlPagedQueryRequest) => Promise<SqlPagedQueryResult>;
};

export type CreateSqlConsoleClientConfig = {
  runtime: { shouldUseInMemoryFallback: () => boolean };
  transport: Pick<SqliteTransport, "sendWorkerRequest">;
  requestTypes?: { executeScript: string; executePagedQuery: string };
  now?: () => number;
  log?: (message: string, ...details: unknown[]) => void;
  createUnavailableError?: (operation: "script" | "paged-query") => Error;
};

function defaultNow(): number {
  return typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
}

function stableStringify(value: unknown): string {
  if (value == null || typeof value !== "object") return JSON.stringify(value) ?? String(value);
  if (Array.isArray(value)) return `[${value.map(item => stableStringify(item)).join(",")}]`;

  const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`;
}

export function createSqlConsoleClient(config: CreateSqlConsoleClientConfig): SqlConsoleClient {
  const inFlightPagedQueries = new Map<string, Promise<SqlPagedQueryResult>>();
  const now = config.now ?? defaultNow;
  const requestTypes = config.requestTypes ?? {
    executeScript: "executeSqlScript",
    executePagedQuery: "executePagedQuery",
  };
  const unavailableError =
    config.createUnavailableError ??
    (operation =>
      new Error(`SQLite ${operation === "script" ? "SQL console" : "paged query execution"} is unavailable.`));

  return {
    async executeScript(script) {
      if (config.runtime.shouldUseInMemoryFallback()) throw unavailableError("script");
      return await config.transport.sendWorkerRequest<SqlExecutionResult>({
        type: requestTypes.executeScript,
        script,
      });
    },
    async executePagedQuery(request) {
      if (config.runtime.shouldUseInMemoryFallback()) throw unavailableError("paged-query");

      const dedupeKey = stableStringify(request);
      const existing = inFlightPagedQueries.get(dedupeKey);
      if (existing) {
        config.log?.("executePagedQuery dedupe hit");
        return await existing;
      }

      const promise = config.transport.sendWorkerRequest<SqlPagedQueryResult>({
        type: requestTypes.executePagedQuery,
        ...request,
        clientSentAtMs: now(),
      });
      inFlightPagedQueries.set(dedupeKey, promise);

      try {
        return await promise;
      } finally {
        inFlightPagedQueries.delete(dedupeKey);
      }
    },
  };
}
