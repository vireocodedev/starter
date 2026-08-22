import { type OfflineSyncCommand } from "@/offline/queue/queueingTypes";

export type OfflineSyncResultReason = "APPLIED" | "ALREADY_APPLIED" | "RETRYABLE" | "REJECTED" | "RETRY_LIMIT_EXCEEDED";

export type OfflineSyncCommandResult = {
  commandId: string;
  success: boolean;
  status: number;
  error: string | null;
  reason?: OfflineSyncResultReason | null;
};

export type OfflineSyncBatchResponse = {
  accepted: number;
  failed: number;
  results: OfflineSyncCommandResult[];
};

export type OfflineSyncCommandDto = Pick<OfflineSyncCommand, "commandId" | "method" | "url" | "body" | "headers">;

export type OfflineSyncReplayDependencies = {
  getBatch: (batchSize: number) => Promise<OfflineSyncCommand[]>;
  sendBatch: (commands: OfflineSyncCommandDto[]) => Promise<OfflineSyncBatchResponse>;
  cleanupSuccessfulCommands: (commands: OfflineSyncCommand[]) => Promise<void>;
  deleteSuccessful: (commandIds: string[]) => Promise<void>;
  markPermanentlyFailed: (commandIds: string[], lastError: string | null) => Promise<void>;
  markRetryable: (commandIds: string[], lastError: string | null, maxAttempts: number) => Promise<void>;
  refreshStatus: () => Promise<void>;
};

const PERMANENT_FAILURE_REASONS: ReadonlySet<string> = new Set<OfflineSyncResultReason>([
  "REJECTED",
  "RETRY_LIMIT_EXCEEDED",
]);

function isPermanentFailure(result: OfflineSyncCommandResult): boolean {
  return !result.success && result.reason != null && PERMANENT_FAILURE_REASONS.has(result.reason);
}

function toSyncCommandDto(command: OfflineSyncCommand): OfflineSyncCommandDto {
  return {
    commandId: command.commandId,
    method: command.method,
    url: command.url,
    body: command.body,
    headers: command.headers,
  };
}

export async function replayOfflineSyncBatch(args: {
  batchSize: number;
  maxAttempts: number;
  dependencies: OfflineSyncReplayDependencies;
}): Promise<number> {
  const { batchSize, maxAttempts, dependencies } = args;
  if (!Number.isInteger(batchSize) || batchSize <= 0) {
    throw new Error("batchSize must be a positive integer.");
  }
  if (!Number.isInteger(maxAttempts) || maxAttempts <= 0) {
    throw new Error("maxAttempts must be a positive integer.");
  }
  const batch = await dependencies.getBatch(batchSize);
  if (batch.length === 0) return 0;

  const response = await dependencies.sendBatch(batch.map(toSyncCommandDto));
  const resultsByCommandId = new Map(response.results.map(result => [result.commandId, result]));
  const successfulCommandIds: string[] = [];
  const permanentlyFailedCommandIds: string[] = [];
  const retryableCommandIds: string[] = [];
  let lastPermanentError: string | null = null;
  let lastRetryableError: string | null = null;

  for (const command of batch) {
    const result = resultsByCommandId.get(command.commandId);
    if (!result) {
      retryableCommandIds.push(command.commandId);
    } else if (result.success) {
      successfulCommandIds.push(command.commandId);
    } else if (isPermanentFailure(result)) {
      permanentlyFailedCommandIds.push(command.commandId);
      lastPermanentError = result.error ?? lastPermanentError;
    } else {
      retryableCommandIds.push(command.commandId);
      lastRetryableError = result.error ?? lastRetryableError;
    }
  }

  const successfulIds = new Set(successfulCommandIds);
  await dependencies.cleanupSuccessfulCommands(batch.filter(command => successfulIds.has(command.commandId)));
  if (successfulCommandIds.length > 0) await dependencies.deleteSuccessful(successfulCommandIds);
  await dependencies.markPermanentlyFailed(permanentlyFailedCommandIds, lastPermanentError);
  await dependencies.markRetryable(retryableCommandIds, lastRetryableError, maxAttempts);
  await dependencies.refreshStatus();
  return successfulCommandIds.length;
}
