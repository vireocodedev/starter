import {
  deleteOfflineCommands,
  enqueueOfflineCommand,
  getOfflineQueueSize,
  getOfflineQueueStatusCounts,
  getPendingOfflineCommands,
  markOfflineCommandsPermanentlyFailed,
  markOfflineCommandsRetryable,
  OFFLINE_QUEUE_STATE_SQLITE_REQUEST_HANDLERS,
} from "@/offline-queue/offlineQueueStateSqlite";
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { type SqliteDatabase } from "@/index";
import { beforeAll, describe, expect, it } from "vitest";

type TestDatabase = SqliteDatabase & { close: () => void };
type Sqlite3Module = { oo1: { DB: new (filename?: string) => TestDatabase } };

describe("offlineQueueStateSqlite", () => {
  let sqlite3: Sqlite3Module;

  beforeAll(async () => {
    sqlite3 = (await sqlite3InitModule()) as unknown as Sqlite3Module;
  }, 30000);

  function openDatabase(): TestDatabase {
    const db = new sqlite3.oo1.DB(":memory:");
    db.exec(`
      CREATE TABLE offline_sync_commands (
        command_id TEXT PRIMARY KEY,
        method TEXT NOT NULL,
        url TEXT NOT NULL,
        body_json TEXT,
        headers_json TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT
      );
    `);
    return db;
  }

  it("owns the complete worker protocol instead of layering retry handlers over a second queue", () => {
    expect(Object.keys(OFFLINE_QUEUE_STATE_SQLITE_REQUEST_HANDLERS).sort()).toEqual([
      "deleteCommands",
      "enqueue",
      "getPendingBatch",
      "getQueueSize",
      "getStatusCounts",
      "markCommandsPermanentlyFailed",
      "markCommandsRetryable",
    ]);
  });

  it("persists ordered commands and applies retry retention atomically", () => {
    const db = openDatabase();
    enqueueOfflineCommand(db, {
      commandId: "later",
      method: "PUT",
      url: "/api/product/1",
      body: { description: "Leather" },
      headers: { "X-Trace": "two" },
      createdAt: 2,
    });
    enqueueOfflineCommand(db, {
      commandId: "first",
      method: "POST",
      url: "/api/product",
      body: null,
      headers: {},
      createdAt: 1,
    });

    expect(getPendingOfflineCommands(db, 10).map(command => command.commandId)).toEqual(["first", "later"]);
    markOfflineCommandsRetryable(db, ["first"], "temporary", 2);
    markOfflineCommandsRetryable(db, ["first"], "exhausted", 2);
    markOfflineCommandsPermanentlyFailed(db, ["later"], "rejected");

    expect(getOfflineQueueStatusCounts(db)).toEqual({ pending: 0, permanentlyFailed: 2 });
    expect(getPendingOfflineCommands(db, 10)).toEqual([]);
    expect(getOfflineQueueSize(db)).toBe(2);

    deleteOfflineCommands(db, ["first", "later"]);
    expect(getOfflineQueueSize(db)).toBe(0);
    db.close();
  });

  it("rejects corrupted persisted commands instead of replaying altered data", () => {
    const db = openDatabase();
    db.exec(`
      INSERT INTO offline_sync_commands
        (command_id, method, url, body_json, headers_json, created_at, status, retry_count)
      VALUES ('corrupt', 'POST', '/api/product', '{broken', '{}', 1, 'PENDING', 0);
    `);

    expect(() => getPendingOfflineCommands(db, 10)).toThrow(
      'Offline command "corrupt" contains invalid JSON in body_json.',
    );
    db.close();
  });

  it("rejects invalid queue limits", () => {
    const db = openDatabase();
    expect(() => getPendingOfflineCommands(db, 0)).toThrow("batchSize must be a positive integer.");
    expect(() => markOfflineCommandsRetryable(db, ["missing"], null, 0)).toThrow(
      "maxRetryCount must be a positive integer.",
    );
    db.close();
  });
});
