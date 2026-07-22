export type SqliteStatement = {
  bind: (value: readonly unknown[]) => SqliteStatement;
  step: () => boolean;
  get: (target: unknown[]) => unknown[];
  getColumnNames?: (target?: string[]) => string[];
  finalize: () => number | undefined;
};

export type SqliteDatabase = {
  exec: (sql: string) => unknown;
  prepare: (sql: string) => SqliteStatement;
};

export type SqliteMigration = (db: SqliteDatabase) => void;
