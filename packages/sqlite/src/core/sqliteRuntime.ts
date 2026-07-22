import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { type SqliteDatabase, type SqliteMigration } from "./sqliteTypes";

const SQLITE_BOOT_LOG_PREFIX = "[SQLITE-BOOT]";
const debug = import.meta.env.DEV;

function nowMs(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }

  return Date.now();
}

function logSqliteBoot(message: string, ...details: unknown[]): void {
  if (!debug) {
    return;
  }

  console.debug(`${SQLITE_BOOT_LOG_PREFIX} ${message}`, ...details);
}

type SqliteModule = {
  oo1: {
    DB: new (filename?: string, flags?: string) => SqliteDatabase;
    OpfsDb?: new (filename?: string, flags?: string) => SqliteDatabase;
  };
  opfs?: unknown;
};

export function mapSqliteRuntimeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown worker error";
}

function getOpfsDiagnostics(module: SqliteModule): Record<string, boolean> {
  const hasNavigator = typeof navigator !== "undefined";
  const hasStorage = hasNavigator && navigator.storage != null;

  return {
    crossOriginIsolated: globalThis.crossOriginIsolated === true,
    hasSharedArrayBuffer: typeof SharedArrayBuffer !== "undefined",
    hasNavigator,
    hasNavigatorStorage: hasStorage,
    hasStorageGetDirectory: hasStorage && typeof navigator.storage.getDirectory === "function",
    hasOpfsDbCtor: typeof module.oo1.OpfsDb === "function",
    hasSqliteOpfsNamespace: module.opfs != null,
  };
}

function formatOpfsDiagnostics(module: SqliteModule): string {
  const diagnostics = getOpfsDiagnostics(module);
  return Object.entries(diagnostics)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

function openDatabase(module: SqliteModule, dbFile: string): SqliteDatabase {
  if (typeof module.oo1.OpfsDb !== "function") {
    throw new Error(
      `[offline-sqlite] OPFS database constructor is unavailable. Diagnostics: ${formatOpfsDiagnostics(module)}.`,
    );
  }

  try {
    return new module.oo1.OpfsDb(dbFile);
  } catch (error) {
    throw new Error(
      `[offline-sqlite] Failed to open OPFS SQLite database: ${mapSqliteRuntimeError(error)}. Diagnostics: ${formatOpfsDiagnostics(module)}.`,
    );
  }
}

export function querySingleNumber(db: SqliteDatabase, sql: string): number {
  const statement = db.prepare(sql);

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

export function getSchemaVersion(db: SqliteDatabase): number {
  return querySingleNumber(db, "PRAGMA user_version;");
}

export function setSchemaVersion(db: SqliteDatabase, version: number): void {
  db.exec(`PRAGMA user_version = ${version};`);
}

export function applySqliteMigrations(db: SqliteDatabase, migrations: SqliteMigration[]): void {
  const startedAt = nowMs();
  db.exec("BEGIN;");

  try {
    const currentVersion = getSchemaVersion(db);
    logSqliteBoot(`migrations start (current=${currentVersion}, target=${migrations.length})`);

    for (let index = currentVersion; index < migrations.length; index += 1) {
      const migrationStartedAt = nowMs();
      migrations[index](db);
      setSchemaVersion(db, index + 1);
      logSqliteBoot(`migration ${index + 1} applied in ${Math.round(nowMs() - migrationStartedAt)}ms`);
    }

    if (getSchemaVersion(db) > migrations.length) {
      throw new Error("Database schema version is newer than supported client version.");
    }

    db.exec("COMMIT;");
    logSqliteBoot(`migrations done in ${Math.round(nowMs() - startedAt)}ms`);
  } catch (error) {
    db.exec("ROLLBACK;");
    logSqliteBoot(`migrations failed after ${Math.round(nowMs() - startedAt)}ms`, error);
    throw error;
  }
}

export async function initializeSqliteDatabase(dbFile: string, migrations: SqliteMigration[]): Promise<SqliteDatabase> {
  const totalStartedAt = nowMs();
  logSqliteBoot("sqlite runtime init start");

  const wasmStartedAt = nowMs();
  const module = (await sqlite3InitModule()) as unknown as SqliteModule;
  logSqliteBoot(`sqlite wasm module ready in ${Math.round(nowMs() - wasmStartedAt)}ms`);

  const openStartedAt = nowMs();
  const db = openDatabase(module, dbFile);
  logSqliteBoot(`sqlite db open in ${Math.round(nowMs() - openStartedAt)}ms`);

  const migrationsStartedAt = nowMs();
  applySqliteMigrations(db, migrations);
  logSqliteBoot(`sqlite migrations stage in ${Math.round(nowMs() - migrationsStartedAt)}ms`);
  logSqliteBoot(`sqlite runtime init done in ${Math.round(nowMs() - totalStartedAt)}ms`);
  return db;
}
