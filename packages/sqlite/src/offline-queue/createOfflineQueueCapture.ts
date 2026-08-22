import { extractReplayHeaders, normalizeHeaders } from "../offline/queue/queueingHeaders";
import { type OfflineSyncCommand } from "../offline/queue/queueingTypes";

export type OfflineQueueCaptureRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, unknown>;
};

export type CreateOfflineQueueCaptureConfig<TRequest extends OfflineQueueCaptureRequest> = {
  resolveUrl: (request: TRequest) => string;
  createCommandId: () => string;
  now: () => number;
  enqueue: (command: OfflineSyncCommand) => Promise<void>;
  markEnqueued: () => void;
  refreshStatus: () => Promise<void>;
};

/** Captures a transport request as a replayable command; transport-specific URL resolution stays injected. */
export function createOfflineQueueCapture<TRequest extends OfflineQueueCaptureRequest>(
  config: CreateOfflineQueueCaptureConfig<TRequest>,
): (request: TRequest) => Promise<OfflineSyncCommand> {
  return async request => {
    const command: OfflineSyncCommand = {
      commandId: config.createCommandId(),
      method: (request.method ?? "get").toUpperCase(),
      url: config.resolveUrl(request),
      body: request.body ?? null,
      headers: extractReplayHeaders(normalizeHeaders(request.headers)),
      createdAt: config.now(),
    };

    await config.enqueue(command);
    config.markEnqueued();
    await config.refreshStatus();
    return command;
  };
}
