export type SqliteQueryEngineConfigRecord = {
  entities: unknown[];
  entityDefinitions: Record<string, unknown>;
};

export type QueryEngineConfigSqliteOperationMap = {
  replaceQueryEngineConfig: { request: { config: SqliteQueryEngineConfigRecord }; response: null };
  getQueryEngineConfig: { request: Record<string, never>; response: SqliteQueryEngineConfigRecord | null };
};

export type QueryEngineConfigSqliteStatement = {
  bind: (values: readonly unknown[]) => unknown;
  step: () => boolean;
  get: (target: unknown[]) => unknown[];
  finalize: () => unknown;
};

export type QueryEngineConfigSqliteDatabase = {
  prepare: (sql: string) => QueryEngineConfigSqliteStatement;
};

export type QueryEngineConfigSqliteRequest = Record<string, unknown>;
export type QueryEngineConfigSqliteRequestHandler = (
  db: QueryEngineConfigSqliteDatabase,
  request: QueryEngineConfigSqliteRequest,
) => unknown;

export type CreateQueryEngineConfigSqliteHandlersConfig = {
  tableName: string;
  singletonKey?: string;
  requestTypes?: { replace: string; get: string };
  parseJson?: <T>(value: string, fallback: T) => T;
};

function defaultParseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function replaceQueryEngineConfig(
  db: QueryEngineConfigSqliteDatabase,
  config: SqliteQueryEngineConfigRecord,
  options: { tableName: string; singletonKey?: string },
): void {
  const statement = db.prepare(`
    INSERT INTO ${options.tableName} (singleton_key, entities_json, entity_definitions_json)
    VALUES (?, ?, ?)
    ON CONFLICT(singleton_key) DO UPDATE SET
      entities_json = excluded.entities_json,
      entity_definitions_json = excluded.entity_definitions_json;
  `);
  try {
    statement.bind([
      options.singletonKey ?? "singleton",
      JSON.stringify(config.entities),
      JSON.stringify(config.entityDefinitions),
    ]);
    statement.step();
  } finally {
    statement.finalize();
  }
}

export function getQueryEngineConfig(
  db: QueryEngineConfigSqliteDatabase,
  options: {
    tableName: string;
    singletonKey?: string;
    parseJson?: <T>(value: string, fallback: T) => T;
  },
): SqliteQueryEngineConfigRecord | null {
  const statement = db.prepare(`
    SELECT entities_json, entity_definitions_json
    FROM ${options.tableName}
    WHERE singleton_key = ?
    LIMIT 1;
  `);
  try {
    statement.bind([options.singletonKey ?? "singleton"]);
    if (!statement.step()) return null;
    const row = statement.get([]);
    const parseJson = options.parseJson ?? defaultParseJson;
    return {
      entities: parseJson<unknown[]>(String(row[0] ?? "[]"), []),
      entityDefinitions: parseJson<Record<string, unknown>>(String(row[1] ?? "{}"), {}),
    };
  } finally {
    statement.finalize();
  }
}

export function createQueryEngineConfigSqliteRequestHandlers(
  config: CreateQueryEngineConfigSqliteHandlersConfig,
): Record<string, QueryEngineConfigSqliteRequestHandler> {
  const requestTypes = config.requestTypes ?? {
    replace: "replaceQueryEngineConfig",
    get: "getQueryEngineConfig",
  };
  const persistenceOptions = {
    tableName: config.tableName,
    singletonKey: config.singletonKey,
  };

  return {
    [requestTypes.replace]: (db, request) => {
      replaceQueryEngineConfig(db, request.config as SqliteQueryEngineConfigRecord, persistenceOptions);
      return null;
    },
    [requestTypes.get]: db => {
      return getQueryEngineConfig(db, { ...persistenceOptions, parseJson: config.parseJson });
    },
  };
}
