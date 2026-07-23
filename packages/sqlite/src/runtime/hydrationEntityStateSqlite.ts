import { createSqliteRequestHandlers } from "../core/sqliteRequestHandlers";
import { type SqliteDatabase } from "../core/sqliteTypes";
import { type SqliteHydrationEntityStateRecord } from "./contracts";

export type HydrationEntityStateSqliteOperationMap = {
  listHydrationEntityStates: { request: {}; response: SqliteHydrationEntityStateRecord[] };
  upsertHydrationEntityState: { request: { state: SqliteHydrationEntityStateRecord }; response: null };
};

const HYDRATION_ENTITY_STATE_TABLE = "hydration_entity_state";

export function listHydrationEntityStates(db: SqliteDatabase): SqliteHydrationEntityStateRecord[] {
  const statement = db.prepare(`
    SELECT entity_key, applied_revision, is_stale, last_hydrated_at, last_row_count, last_error
    FROM ${HYDRATION_ENTITY_STATE_TABLE}
    ORDER BY entity_key ASC;
  `);

  const rows: SqliteHydrationEntityStateRecord[] = [];

  try {
    while (statement.step()) {
      const row = statement.get([]);
      rows.push({
        entityKey: String(row[0] ?? ""),
        appliedRevision: Number(row[1] ?? 0),
        isStale: Number(row[2] ?? 0) === 1,
        lastHydratedAt: row[3] == null ? null : Number(row[3]),
        lastRowCount: row[4] == null ? null : Number(row[4]),
        lastError: row[5] == null ? null : String(row[5]),
      });
    }
  } finally {
    statement.finalize();
  }

  return rows;
}

export function upsertHydrationEntityState(db: SqliteDatabase, state: SqliteHydrationEntityStateRecord): void {
  const statement = db.prepare(`
    INSERT INTO ${HYDRATION_ENTITY_STATE_TABLE}
      (entity_key, applied_revision, is_stale, last_hydrated_at, last_row_count, last_error)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(entity_key) DO UPDATE SET
      applied_revision = excluded.applied_revision,
      is_stale = excluded.is_stale,
      last_hydrated_at = excluded.last_hydrated_at,
      last_row_count = excluded.last_row_count,
      last_error = excluded.last_error;
  `);

  try {
    statement.bind([
      state.entityKey,
      state.appliedRevision,
      state.isStale ? 1 : 0,
      state.lastHydratedAt,
      state.lastRowCount,
      state.lastError,
    ]);
    statement.step();
  } finally {
    statement.finalize();
  }
}

export const HYDRATION_ENTITY_STATE_SQLITE_REQUEST_HANDLERS = createSqliteRequestHandlers({
  listHydrationEntityStates: (db: SqliteDatabase) => {
    return listHydrationEntityStates(db);
  },
  upsertHydrationEntityState: (db: SqliteDatabase, request) => {
    const typedRequest = request as unknown as { state: SqliteHydrationEntityStateRecord };
    upsertHydrationEntityState(db, typedRequest.state);
    return null;
  },
});
