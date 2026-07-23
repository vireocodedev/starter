import { deleteSqliteRowsByKey } from "../core/sqliteCrud";
import { createSqliteRequestHandlers } from "../core/sqliteRequestHandlers";
import { type SqliteDatabase } from "../core/sqliteTypes";
import { type OfflineSyncCommandRecord } from "./contracts";

export type OfflineSyncCommandSqliteOperationMap = {
  enqueue: { request: { command: OfflineSyncCommandRecord }; response: null };
  getBatch: { request: { batchSize: number }; response: OfflineSyncCommandRecord[] };
  deleteCommands: { request: { commandIds: string[] }; response: null };
  getQueueSize: { request: {}; response: number };
};

const OFFLINE_SYNC_TABLE = "offline_sync_commands";

function parseJsonValue<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function enqueueOfflineSyncCommand(db: SqliteDatabase, command: OfflineSyncCommandRecord): Promise<void> {
  const statement = db.prepare(`
    INSERT OR REPLACE INTO ${OFFLINE_SYNC_TABLE}
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

export function getOfflineSyncCommandsBatch(db: SqliteDatabase, batchSize: number): OfflineSyncCommandRecord[] {
  const statement = db.prepare(`
    SELECT command_id, method, url, body_json, headers_json, created_at
    FROM ${OFFLINE_SYNC_TABLE}
    ORDER BY created_at ASC
    LIMIT ?;
  `);

  const commands: OfflineSyncCommandRecord[] = [];

  try {
    statement.bind([batchSize]);
    while (statement.step()) {
      const row = statement.get([]);

      commands.push({
        commandId: String(row[0] ?? ""),
        method: String(row[1] ?? ""),
        url: String(row[2] ?? ""),
        body: parseJsonValue(String(row[3] ?? "null"), null),
        headers: parseJsonValue<Record<string, string>>(String(row[4] ?? "{}"), {}),
        createdAt: Number(row[5] ?? 0),
      });
    }
  } finally {
    statement.finalize();
  }

  return commands;
}

export async function deleteOfflineSyncCommands(db: SqliteDatabase, commandIds: string[]): Promise<void> {
  deleteSqliteRowsByKey(db, OFFLINE_SYNC_TABLE, "command_id", commandIds);
}

export function getOfflineSyncQueueSize(db: SqliteDatabase): number {
  const statement = db.prepare(`SELECT COUNT(1) AS count FROM ${OFFLINE_SYNC_TABLE};`);

  try {
    if (!statement.step()) {
      return 0;
    }

    const row = statement.get([]);
    return Number(row[0] ?? 0);
  } finally {
    statement.finalize();
  }
}

export const OFFLINE_SYNC_COMMAND_SQLITE_REQUEST_HANDLERS = createSqliteRequestHandlers({
  enqueue: async (db: SqliteDatabase, request) => {
    const typedRequest = request as unknown as { command: OfflineSyncCommandRecord };
    await enqueueOfflineSyncCommand(db, typedRequest.command);
    return null;
  },
  getBatch: (db: SqliteDatabase, request) => {
    const typedRequest = request as unknown as { batchSize: number };
    return getOfflineSyncCommandsBatch(db, typedRequest.batchSize);
  },
  deleteCommands: async (db: SqliteDatabase, request) => {
    const typedRequest = request as unknown as { commandIds: string[] };
    await deleteOfflineSyncCommands(db, typedRequest.commandIds);
    return null;
  },
  getQueueSize: (db: SqliteDatabase) => {
    return getOfflineSyncQueueSize(db);
  },
});
