import { runSqliteTransaction } from "../core/sqliteCrud";
import { createSqliteRequestHandlers } from "../core/sqliteRequestHandlers";
import { type SqliteDatabase } from "../core/sqliteTypes";
import { type OfflineSyncCommandRecord } from "../runtime/contracts";

const OFFLINE_QUEUE_TABLE = "offline_sync_commands";

export const OFFLINE_QUEUE_PENDING = "PENDING";
export const OFFLINE_QUEUE_PERMANENTLY_FAILED = "PERMANENTLY_FAILED";

export type OfflineQueuedCommandStatus = typeof OFFLINE_QUEUE_PENDING | typeof OFFLINE_QUEUE_PERMANENTLY_FAILED;

export type OfflineQueuedCommand = OfflineSyncCommandRecord & {
  status: OfflineQueuedCommandStatus;
  retryCount: number;
  lastError: string | null;
};

export type OfflineQueueStatusCounts = {
  pending: number;
  permanentlyFailed: number;
};

function parseJsonValue(value: string, commandId: string, column: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    throw new Error(`Offline command "${commandId}" contains invalid JSON in ${column}.`);
  }
}

function parseHeaders(value: string, commandId: string): Record<string, string> {
  const parsed = parseJsonValue(value, commandId, "headers_json");
  if (
    parsed == null ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    Object.values(parsed).some(header => typeof header !== "string")
  ) {
    throw new Error(`Offline command "${commandId}" contains invalid headers_json.`);
  }

  return parsed as Record<string, string>;
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
}

function toQueueStatus(value: unknown): OfflineQueuedCommandStatus {
  return String(value ?? OFFLINE_QUEUE_PENDING) === OFFLINE_QUEUE_PERMANENTLY_FAILED
    ? OFFLINE_QUEUE_PERMANENTLY_FAILED
    : OFFLINE_QUEUE_PENDING;
}

export function enqueueOfflineCommand(db: SqliteDatabase, command: OfflineSyncCommandRecord): void {
  const statement = db.prepare(`
    INSERT OR REPLACE INTO ${OFFLINE_QUEUE_TABLE}
      (command_id, method, url, body_json, headers_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?);
  `);

  try {
    statement.bind([
      command.commandId,
      command.method,
      command.url,
      JSON.stringify(command.body ?? null),
      JSON.stringify(command.headers),
      command.createdAt,
    ]);
    statement.step();
  } finally {
    statement.finalize();
  }
}

export function getPendingOfflineCommands(db: SqliteDatabase, batchSize: number): OfflineQueuedCommand[] {
  assertPositiveInteger(batchSize, "batchSize");
  const statement = db.prepare(`
    SELECT command_id, method, url, body_json, headers_json, created_at, status, retry_count, last_error
    FROM ${OFFLINE_QUEUE_TABLE}
    WHERE status = '${OFFLINE_QUEUE_PENDING}'
    ORDER BY created_at ASC
    LIMIT ?;
  `);
  const commands: OfflineQueuedCommand[] = [];

  try {
    statement.bind([batchSize]);
    while (statement.step()) {
      const row = statement.get([]);
      const commandId = String(row[0] ?? "");
      commands.push({
        commandId,
        method: String(row[1] ?? ""),
        url: String(row[2] ?? ""),
        body: parseJsonValue(String(row[3] ?? "null"), commandId, "body_json"),
        headers: parseHeaders(String(row[4] ?? "{}"), commandId),
        createdAt: Number(row[5] ?? 0),
        status: toQueueStatus(row[6]),
        retryCount: Number(row[7] ?? 0),
        lastError: row[8] == null ? null : String(row[8]),
      });
    }
  } finally {
    statement.finalize();
  }

  return commands;
}

export function deleteOfflineCommands(db: SqliteDatabase, commandIds: string[]): void {
  if (commandIds.length === 0) return;

  runSqliteTransaction(db, () => {
    for (const commandId of commandIds) {
      const statement = db.prepare(`DELETE FROM ${OFFLINE_QUEUE_TABLE} WHERE command_id = ?;`);
      try {
        statement.bind([commandId]);
        statement.step();
      } finally {
        statement.finalize();
      }
    }
  });
}

export function getOfflineQueueSize(db: SqliteDatabase): number {
  const statement = db.prepare(`SELECT COUNT(1) AS count FROM ${OFFLINE_QUEUE_TABLE};`);
  try {
    return statement.step() ? Number(statement.get([])[0] ?? 0) : 0;
  } finally {
    statement.finalize();
  }
}

export function getOfflineQueueStatusCounts(db: SqliteDatabase): OfflineQueueStatusCounts {
  const statement = db.prepare(`
    SELECT status, COUNT(1) AS count
    FROM ${OFFLINE_QUEUE_TABLE}
    GROUP BY status;
  `);
  const counts: OfflineQueueStatusCounts = { pending: 0, permanentlyFailed: 0 };

  try {
    while (statement.step()) {
      const row = statement.get([]);
      const count = Number(row[1] ?? 0);
      if (toQueueStatus(row[0]) === OFFLINE_QUEUE_PERMANENTLY_FAILED) counts.permanentlyFailed = count;
      else counts.pending = count;
    }
  } finally {
    statement.finalize();
  }

  return counts;
}

export function markOfflineCommandsRetryable(
  db: SqliteDatabase,
  commandIds: string[],
  lastError: string | null,
  maxRetryCount: number,
): void {
  if (commandIds.length === 0) return;
  assertPositiveInteger(maxRetryCount, "maxRetryCount");

  runSqliteTransaction(db, () => {
    for (const commandId of commandIds) {
      const statement = db.prepare(`
        UPDATE ${OFFLINE_QUEUE_TABLE}
        SET retry_count = retry_count + 1,
            last_error = ?,
            status = CASE
              WHEN retry_count + 1 >= ? THEN '${OFFLINE_QUEUE_PERMANENTLY_FAILED}'
              ELSE status
            END
        WHERE command_id = ?;
      `);
      try {
        statement.bind([lastError, maxRetryCount, commandId]);
        statement.step();
      } finally {
        statement.finalize();
      }
    }
  });
}

export function markOfflineCommandsPermanentlyFailed(
  db: SqliteDatabase,
  commandIds: string[],
  lastError: string | null,
): void {
  if (commandIds.length === 0) return;

  runSqliteTransaction(db, () => {
    for (const commandId of commandIds) {
      const statement = db.prepare(`
        UPDATE ${OFFLINE_QUEUE_TABLE}
        SET status = '${OFFLINE_QUEUE_PERMANENTLY_FAILED}', last_error = ?
        WHERE command_id = ?;
      `);
      try {
        statement.bind([lastError, commandId]);
        statement.step();
      } finally {
        statement.finalize();
      }
    }
  });
}

export const OFFLINE_QUEUE_STATE_SQLITE_REQUEST_HANDLERS = createSqliteRequestHandlers({
  enqueue: (db: SqliteDatabase, request) => {
    enqueueOfflineCommand(db, (request as unknown as { command: OfflineSyncCommandRecord }).command);
    return null;
  },
  getPendingBatch: (db: SqliteDatabase, request) =>
    getPendingOfflineCommands(db, (request as unknown as { batchSize: number }).batchSize),
  deleteCommands: (db: SqliteDatabase, request) => {
    deleteOfflineCommands(db, (request as unknown as { commandIds: string[] }).commandIds);
    return null;
  },
  getQueueSize: (db: SqliteDatabase) => getOfflineQueueSize(db),
  getStatusCounts: (db: SqliteDatabase) => getOfflineQueueStatusCounts(db),
  markCommandsRetryable: (db: SqliteDatabase, request) => {
    const typedRequest = request as unknown as {
      commandIds: string[];
      lastError: string | null;
      maxRetryCount: number;
    };
    markOfflineCommandsRetryable(db, typedRequest.commandIds, typedRequest.lastError, typedRequest.maxRetryCount);
    return null;
  },
  markCommandsPermanentlyFailed: (db: SqliteDatabase, request) => {
    const typedRequest = request as unknown as { commandIds: string[]; lastError: string | null };
    markOfflineCommandsPermanentlyFailed(db, typedRequest.commandIds, typedRequest.lastError);
    return null;
  },
});
