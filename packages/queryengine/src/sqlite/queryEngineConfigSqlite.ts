import z from "zod";

export type SqliteQueryEngineConfigRecord = {
  entities: unknown[];
  entityDefinitions: Record<string, unknown>;
};

export const SqliteQueryEngineConfigRecordSchema: z.ZodType<SqliteQueryEngineConfigRecord> = z.object({
  entities: z.array(z.unknown()),
  entityDefinitions: z.record(z.string(), z.unknown()),
});

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

function defaultParseJson<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error("Stored query-engine config contains malformed JSON.");
  }
}

function assertSqliteIdentifier(value: string, label: string): void {
  if (!/^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)?$/.test(value)) {
    throw new Error(`${label} must be a valid SQLite identifier.`);
  }
}

function resolveSingletonKey(value: string | undefined): string {
  const singletonKey = value ?? "singleton";
  if (!singletonKey.trim()) throw new Error("Query-engine config singleton key must be non-empty.");
  return singletonKey;
}

function resolveRequestTypes(requestTypes: { replace: string; get: string } | undefined): {
  replace: string;
  get: string;
} {
  const resolved = requestTypes ?? {
    replace: "replaceQueryEngineConfig",
    get: "getQueryEngineConfig",
  };
  if (!resolved.replace.trim() || !resolved.get.trim()) {
    throw new Error("Query-engine config request types must be non-empty.");
  }
  if (resolved.replace === resolved.get) {
    throw new Error("Query-engine config replace and get request types must be distinct.");
  }
  return resolved;
}

export function replaceQueryEngineConfig(
  db: QueryEngineConfigSqliteDatabase,
  config: SqliteQueryEngineConfigRecord,
  options: { tableName: string; singletonKey?: string },
): void {
  assertSqliteIdentifier(options.tableName, "Query-engine config table name");
  const parsedConfig = SqliteQueryEngineConfigRecordSchema.parse(config);
  const statement = db.prepare(`
    INSERT INTO ${options.tableName} (singleton_key, entities_json, entity_definitions_json)
    VALUES (?, ?, ?)
    ON CONFLICT(singleton_key) DO UPDATE SET
      entities_json = excluded.entities_json,
      entity_definitions_json = excluded.entity_definitions_json;
  `);
  try {
    statement.bind([
      resolveSingletonKey(options.singletonKey),
      JSON.stringify(parsedConfig.entities),
      JSON.stringify(parsedConfig.entityDefinitions),
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
  assertSqliteIdentifier(options.tableName, "Query-engine config table name");
  const statement = db.prepare(`
    SELECT entities_json, entity_definitions_json
    FROM ${options.tableName}
    WHERE singleton_key = ?
    LIMIT 1;
  `);
  try {
    statement.bind([resolveSingletonKey(options.singletonKey)]);
    if (!statement.step()) return null;
    const row = statement.get([]);
    const parseJson = options.parseJson ?? defaultParseJson;
    return SqliteQueryEngineConfigRecordSchema.parse({
      entities: parseJson<unknown[]>(String(row[0] ?? "[]"), []),
      entityDefinitions: parseJson<Record<string, unknown>>(String(row[1] ?? "{}"), {}),
    });
  } finally {
    statement.finalize();
  }
}

export function createQueryEngineConfigSqliteRequestHandlers(
  config: CreateQueryEngineConfigSqliteHandlersConfig,
): Record<string, QueryEngineConfigSqliteRequestHandler> {
  assertSqliteIdentifier(config.tableName, "Query-engine config table name");
  resolveSingletonKey(config.singletonKey);
  const requestTypes = resolveRequestTypes(config.requestTypes);
  const persistenceOptions = {
    tableName: config.tableName,
    singletonKey: config.singletonKey,
  };

  return {
    [requestTypes.replace]: (db, request) => {
      replaceQueryEngineConfig(db, SqliteQueryEngineConfigRecordSchema.parse(request.config), persistenceOptions);
      return null;
    },
    [requestTypes.get]: db => {
      return getQueryEngineConfig(db, { ...persistenceOptions, parseJson: config.parseJson });
    },
  };
}
