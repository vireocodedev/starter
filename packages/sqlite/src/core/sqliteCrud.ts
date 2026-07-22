import { type SqliteDatabase } from "./sqliteTypes";

export function runSqliteTransaction(db: SqliteDatabase, action: () => void): void {
  db.exec("BEGIN;");

  try {
    action();
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
}

export function listSqliteRows<T>(db: SqliteDatabase, sql: string, mapRow: (row: unknown[]) => T): T[] {
  const statement = db.prepare(sql);
  const rows: T[] = [];

  try {
    while (statement.step()) {
      rows.push(mapRow(statement.get([])));
    }
  } finally {
    statement.finalize();
  }

  return rows;
}

export function deleteSqliteRowsByKey(
  db: SqliteDatabase,
  table: string,
  keyColumn: string,
  values: Array<number | string>,
): void {
  if (values.length === 0) {
    return;
  }

  runSqliteTransaction(db, () => {
    for (const value of values) {
      const statement = db.prepare(`DELETE FROM ${table} WHERE ${keyColumn} = ?;`);

      try {
        statement.bind([value]);
        statement.step();
      } finally {
        statement.finalize();
      }
    }
  });
}
