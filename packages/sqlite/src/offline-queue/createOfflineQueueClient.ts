import {
  OFFLINE_QUEUE_PENDING,
  OFFLINE_QUEUE_PERMANENTLY_FAILED,
  type OfflineQueuedCommand,
  type OfflineQueueStatusCounts,
} from "./offlineQueueStateSqlite";
import { type InMemorySqliteStore } from "../runtime/createManagedSqliteRuntime";
import { type SqliteTransport } from "../runtime/createSqliteTransport";
import { type OfflineSyncCommand } from "../offline/queue/queueingTypes";

export type OfflineQueueClientRuntime = {
  shouldUseInMemoryFallback: () => boolean;
  registerInMemoryStore: (store: InMemorySqliteStore) => () => void;
};

export type OfflineQueueClient = {
  enqueue: (command: OfflineSyncCommand) => Promise<void>;
  getBatch: (batchSize: number) => Promise<OfflineQueuedCommand[]>;
  delete: (commandIds: string[]) => Promise<void>;
  markRetryable: (commandIds: string[], lastError: string | null, maxRetryCount: number) => Promise<void>;
  markPermanentlyFailed: (commandIds: string[], lastError: string | null) => Promise<void>;
  getSize: () => Promise<number>;
  getStatusCounts: () => Promise<OfflineQueueStatusCounts>;
  dispose: () => void;
};

export type CreateOfflineQueueClientConfig = {
  runtime: OfflineQueueClientRuntime;
  transport: Pick<SqliteTransport, "sendWorkerRequest">;
};

export function createOfflineQueueClient(config: CreateOfflineQueueClientConfig): OfflineQueueClient {
  const inMemoryQueue = new Map<string, OfflineQueuedCommand>();
  const unregisterStore = config.runtime.registerInMemoryStore(inMemoryQueue);

  return {
    async enqueue(command) {
      if (config.runtime.shouldUseInMemoryFallback()) {
        inMemoryQueue.set(command.commandId, {
          ...command,
          status: OFFLINE_QUEUE_PENDING,
          retryCount: 0,
          lastError: null,
        });
        return;
      }
      await config.transport.sendWorkerRequest<null>({ type: "enqueue", command });
    },
    async getBatch(batchSize) {
      if (!Number.isInteger(batchSize) || batchSize <= 0) {
        throw new Error("batchSize must be a positive integer.");
      }
      if (config.runtime.shouldUseInMemoryFallback()) {
        return [...inMemoryQueue.values()]
          .filter(command => command.status === OFFLINE_QUEUE_PENDING)
          .sort((left, right) => left.createdAt - right.createdAt)
          .slice(0, batchSize);
      }
      return await config.transport.sendWorkerRequest<OfflineQueuedCommand[]>({ type: "getPendingBatch", batchSize });
    },
    async delete(commandIds) {
      if (config.runtime.shouldUseInMemoryFallback()) {
        for (const commandId of commandIds) inMemoryQueue.delete(commandId);
        return;
      }
      await config.transport.sendWorkerRequest<null>({ type: "deleteCommands", commandIds });
    },
    async markRetryable(commandIds, lastError, maxRetryCount) {
      if (commandIds.length === 0) return;
      if (!Number.isInteger(maxRetryCount) || maxRetryCount <= 0) {
        throw new Error("maxRetryCount must be a positive integer.");
      }
      if (config.runtime.shouldUseInMemoryFallback()) {
        for (const commandId of commandIds) {
          const command = inMemoryQueue.get(commandId);
          if (!command) continue;
          const retryCount = command.retryCount + 1;
          inMemoryQueue.set(commandId, {
            ...command,
            retryCount,
            lastError,
            status: retryCount >= maxRetryCount ? OFFLINE_QUEUE_PERMANENTLY_FAILED : command.status,
          });
        }
        return;
      }
      await config.transport.sendWorkerRequest<null>({
        type: "markCommandsRetryable",
        commandIds,
        lastError,
        maxRetryCount,
      });
    },
    async markPermanentlyFailed(commandIds, lastError) {
      if (commandIds.length === 0) return;
      if (config.runtime.shouldUseInMemoryFallback()) {
        for (const commandId of commandIds) {
          const command = inMemoryQueue.get(commandId);
          if (command) {
            inMemoryQueue.set(commandId, { ...command, lastError, status: OFFLINE_QUEUE_PERMANENTLY_FAILED });
          }
        }
        return;
      }
      await config.transport.sendWorkerRequest<null>({
        type: "markCommandsPermanentlyFailed",
        commandIds,
        lastError,
      });
    },
    async getSize() {
      if (config.runtime.shouldUseInMemoryFallback()) return inMemoryQueue.size;
      return await config.transport.sendWorkerRequest<number>({ type: "getQueueSize" });
    },
    async getStatusCounts() {
      if (!config.runtime.shouldUseInMemoryFallback()) {
        return await config.transport.sendWorkerRequest<OfflineQueueStatusCounts>({ type: "getStatusCounts" });
      }

      let pending = 0;
      let permanentlyFailed = 0;
      for (const command of inMemoryQueue.values()) {
        if (command.status === OFFLINE_QUEUE_PERMANENTLY_FAILED) permanentlyFailed += 1;
        else pending += 1;
      }
      return { pending, permanentlyFailed };
    },
    dispose: unregisterStore,
  };
}
