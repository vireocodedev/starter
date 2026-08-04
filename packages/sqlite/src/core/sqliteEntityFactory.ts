/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { deleteSqliteRowsByKey, listSqliteRows, runSqliteTransaction } from "./sqliteCrud";
import { createSqliteRequestHandlers, type SqliteRequestHandlers } from "./sqliteRequestHandlers";
import { type SqliteDatabase } from "./sqliteTypes";

type SqliteEntityField<TValue> = {
  column: string;
  id?: boolean;
  toDb?: (value: TValue) => unknown;
  fromDb: (value: unknown) => TValue;
};

type SqliteEntityFields = Record<string, SqliteEntityField<any>>;

type SqliteEntityFieldValue<TField> = TField extends SqliteEntityField<infer TValue> ? TValue : never;

type SqliteEntityRecordFromFields<TFields extends SqliteEntityFields> = {
  [
    TProperty in keyof TFields as undefined extends SqliteEntityFieldValue<TFields[TProperty]> ? never : TProperty
  ]: SqliteEntityFieldValue<TFields[TProperty]>;
} & {
  [
    TProperty in keyof TFields as undefined extends SqliteEntityFieldValue<TFields[TProperty]> ? TProperty : never
  ]?: Exclude<SqliteEntityFieldValue<TFields[TProperty]>, undefined>;
};

type SqliteEntityIdPropertyName<TFields extends SqliteEntityFields> = {
  [TProperty in keyof TFields]: TFields[TProperty] extends { id: true } ? TProperty : never;
}[keyof TFields] &
  string;

type SqliteEntityDeletePayloadFromFields<TFields extends SqliteEntityFields> = Pick<
  SqliteEntityRecordFromFields<TFields>,
  Extract<SqliteEntityIdPropertyName<TFields>, keyof SqliteEntityRecordFromFields<TFields>>
>;

type SqliteEntityOperationNames<TSingular extends string, TPlural extends string> = {
  replace: `replace${TPlural}`;
  upsert: `upsert${TSingular}`;
  list: `list${TPlural}`;
  delete: `delete${TPlural}`;
};

export type SqliteEntitySseConfig<
  TFields extends SqliteEntityFields,
  TSseEntity extends string,
  TSseContext extends object,
> = {
  entity: TSseEntity;
  hydrationEntityKey?: string;
  mapCreate?: (
    payload: SqliteEntityRecordFromFields<TFields>,
    context: TSseContext,
  ) => SqliteEntityRecordFromFields<TFields> | null;
  mapUpdate?: (
    payload: SqliteEntityRecordFromFields<TFields>,
    context: TSseContext,
  ) => SqliteEntityRecordFromFields<TFields> | null;
  mapDeleteKeys?: (
    payload: SqliteEntityDeletePayloadFromFields<TFields>,
    context: TSseContext,
  ) => Array<number | string>;
};

export type SqliteEntitySpec<
  TFields extends SqliteEntityFields = SqliteEntityFields,
  TSingular extends string = string,
  TPlural extends string = string,
  TRequestKeys extends { replace: string; upsert: string; delete: string } = {
    replace: string;
    upsert: string;
    delete: string;
  },
  TSseEntity extends string = string,
  TSseContext extends object = object,
> = {
  entityNameSingular: TSingular;
  entityNamePlural: TPlural;
  tableName: string;
  fields: TFields;
  keywordFields?: Array<keyof TFields & string>;
  softDelete?: {
    enabled: boolean;
    columnName?: string;
  };
  orderBy?: string;
  requestKeys: TRequestKeys;
  sse?: SqliteEntitySseConfig<TFields, TSseEntity, TSseContext>;
  hydration?: {
    key: string;
    hydrate: () => Promise<{ rowCount: number }>;
  };
};

export type SqliteEntityBundle<
  TFields extends SqliteEntityFields,
  TOperationNames extends { replace: string; upsert: string; list: string; delete: string },
  TRequestKeys extends { replace: string; upsert: string; delete: string },
  TSseEntity extends string,
  TSseContext extends object,
> = {
  __sqliteEntityBundle: true;
  fields: TFields;
  operationNames: TOperationNames;
  requestKeys: TRequestKeys;
  tableName: string;
  entityNameSingular: string;
  entityNamePlural: string;
  hydration?: {
    key: string;
    hydrate: () => Promise<{ rowCount: number }>;
  };
  replaceRows: (db: SqliteDatabase, rows: SqliteEntityRecordFromFields<TFields>[]) => void;
  upsertRow: (db: SqliteDatabase, row: SqliteEntityRecordFromFields<TFields>) => void;
  listRows: (db: SqliteDatabase) => SqliteEntityRecordFromFields<TFields>[];
  deleteRows: (db: SqliteDatabase, keys: Array<number | string>) => void;
  sse?: SqliteEntitySseConfig<TFields, TSseEntity, TSseContext>;
  requestHandlers: SqliteRequestHandlers;
  operationMap: {
    [TReplace in TOperationNames["replace"]]: {
      request: { [TReplaceKey in TRequestKeys["replace"]]: SqliteEntityRecordFromFields<TFields>[] };
      response: null;
    };
  } & {
    [TUpsert in TOperationNames["upsert"]]: {
      request: { [TUpsertKey in TRequestKeys["upsert"]]: SqliteEntityRecordFromFields<TFields> };
      response: null;
    };
  } & {
    [TList in TOperationNames["list"]]: {
      request: {};
      response: SqliteEntityRecordFromFields<TFields>[];
    };
  } & {
    [TDelete in TOperationNames["delete"]]: {
      request: { [TDeleteKey in TRequestKeys["delete"]]: Array<number | string> };
      response: null;
    };
  };
};

export type SqliteEntityOperationMapFromBundle<
  TBundle extends { operationMap: Record<string, { request: unknown; response: unknown }> },
> = TBundle["operationMap"];

export type SqliteEntityRecordFromBundle<TBundle> = TBundle extends { upsertRow: (...args: infer TArgs) => void }
  ? TArgs extends [SqliteDatabase, infer TRow]
    ? TRow
    : never
  : never;

function buildKeywordValue<TRecord extends Record<string, unknown>>(
  record: TRecord,
  fields: Array<keyof TRecord & string>,
): string {
  return fields
    .map(field => record[field])
    .filter(value => value != null)
    .map(value => String(value).trim())
    .filter(value => value.length > 0)
    .join(" ")
    .trim();
}

export function createSqliteEntityBundle<
  const TFields extends SqliteEntityFields,
  const TSingular extends string,
  const TPlural extends string,
  const TRequestKeys extends { replace: string; upsert: string; delete: string },
  const TSseEntity extends string = string,
  const TSseContext extends object = object,
>(
  spec: SqliteEntitySpec<TFields, TSingular, TPlural, TRequestKeys, TSseEntity, TSseContext>,
): SqliteEntityBundle<TFields, SqliteEntityOperationNames<TSingular, TPlural>, TRequestKeys, TSseEntity, TSseContext> {
  type TRecord = SqliteEntityRecordFromFields<TFields>;
  const fieldEntries = Object.entries(spec.fields) as Array<[keyof TFields & string, TFields[keyof TFields & string]]>;

  const idFields = fieldEntries.filter(([, field]) => field.id === true);
  if (idFields.length !== 1) {
    throw new Error(`Sqlite entity spec for ${spec.entityNameSingular} must define exactly one field with id: true.`);
  }

  const keyField = idFields[0][1];
  const keyColumn = keyField.column;

  const entityNamePlural = spec.entityNamePlural;

  const operationNames = {
    replace: `replace${entityNamePlural}`,
    upsert: `upsert${spec.entityNameSingular}`,
    list: `list${entityNamePlural}`,
    delete: `delete${entityNamePlural}`,
  } as SqliteEntityOperationNames<TSingular, TPlural>;

  const requestKeys = spec.requestKeys;

  const softDeleteEnabled = spec.softDelete?.enabled ?? true;
  const softDeleteColumnName = spec.softDelete?.columnName ?? "deleted";
  const keywordsColumnName = "keywords";

  const mappedColumns = fieldEntries.map(([, field]) => field.column);
  const mappedProperties = fieldEntries.map(([property]) => property);

  const insertColumns = [...mappedColumns, keywordsColumnName];
  if (softDeleteEnabled) {
    insertColumns.push(softDeleteColumnName);
  }

  const keywordFields = (spec.keywordFields ?? mappedProperties) as Array<keyof TRecord & string>;

  function getFieldValueForDb<TProperty extends keyof TRecord & string>(
    property: TProperty,
    field: SqliteEntityField<TRecord[TProperty]>,
    row: TRecord,
  ): unknown {
    const raw = row[property];
    if (field.toDb) {
      return field.toDb(raw);
    }

    return raw;
  }

  function toInsertValues(row: TRecord): unknown[] {
    const values = fieldEntries.map(([property, field]) =>
      getFieldValueForDb(property as keyof TRecord & string, field as SqliteEntityField<any>, row),
    );
    values.push(buildKeywordValue<TRecord>(row, keywordFields));
    if (softDeleteEnabled) {
      values.push(0);
    }

    return values;
  }

  const insertPlaceholders = insertColumns.map(() => "?").join(", ");
  const conflictUpdateColumns = insertColumns.filter(column => column !== keyColumn);

  function replaceRows(db: SqliteDatabase, rows: TRecord[]): void {
    runSqliteTransaction(db, () => {
      db.exec(`DELETE FROM ${spec.tableName};`);

      for (const row of rows) {
        const statement = db.prepare(`
          INSERT INTO ${spec.tableName} (${insertColumns.join(", ")})
          VALUES (${insertPlaceholders});
        `);

        try {
          statement.bind(toInsertValues(row));
          statement.step();
        } finally {
          statement.finalize();
        }
      }
    });
  }

  function upsertRow(db: SqliteDatabase, row: TRecord): void {
    const statement = db.prepare(`
      INSERT INTO ${spec.tableName} (${insertColumns.join(", ")})
      VALUES (${insertPlaceholders})
      ON CONFLICT(${keyColumn}) DO UPDATE SET
        ${conflictUpdateColumns.map(column => `${column} = excluded.${column}`).join(", ")};
    `);

    try {
      statement.bind(toInsertValues(row));
      statement.step();
    } finally {
      statement.finalize();
    }
  }

  function listRows(db: SqliteDatabase): TRecord[] {
    const whereClause = softDeleteEnabled ? `WHERE ${softDeleteColumnName} = 0` : "";
    const orderBy = spec.orderBy ?? keyColumn;

    return listSqliteRows(
      db,
      `
        SELECT ${mappedColumns.join(", ")}
        FROM ${spec.tableName}
        ${whereClause}
        ORDER BY ${orderBy} ASC;
      `,
      row => {
        const mapped = {} as Record<string, unknown>;

        for (let index = 0; index < fieldEntries.length; index += 1) {
          const [property, field] = fieldEntries[index];
          const value = row[index];
          mapped[property] = field.fromDb(value);
        }

        return mapped as TRecord;
      },
    );
  }

  function deleteRows(db: SqliteDatabase, keys: Array<number | string>): void {
    deleteSqliteRowsByKey(db, spec.tableName, keyColumn, keys);
  }

  const requestHandlers = createSqliteRequestHandlers({
    [operationNames.replace]: (db: SqliteDatabase, request: Record<string, unknown>) => {
      replaceRows(db, request[requestKeys.replace] as TRecord[]);
      return null;
    },
    [operationNames.upsert]: (db: SqliteDatabase, request: Record<string, unknown>) => {
      upsertRow(db, request[requestKeys.upsert] as TRecord);
      return null;
    },
    [operationNames.list]: (db: SqliteDatabase) => {
      return listRows(db);
    },
    [operationNames.delete]: (db: SqliteDatabase, request: Record<string, unknown>) => {
      deleteRows(db, request[requestKeys.delete] as Array<number | string>);
      return null;
    },
  }) as SqliteRequestHandlers;

  return {
    __sqliteEntityBundle: true,
    tableName: spec.tableName,
    entityNameSingular: spec.entityNameSingular,
    entityNamePlural: spec.entityNamePlural,
    operationNames,
    requestKeys,
    fields: spec.fields,
    hydration: spec.hydration,
    replaceRows,
    upsertRow,
    listRows,
    deleteRows,
    sse: spec.sse,
    requestHandlers,
    operationMap: undefined as unknown as SqliteEntityBundle<
      TFields,
      SqliteEntityOperationNames<TSingular, TPlural>,
      TRequestKeys,
      TSseEntity,
      TSseContext
    >["operationMap"],
  };
}
