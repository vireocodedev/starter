import { QueryEngineOperatorSchema } from "../models/queryengine.models";
import z from "zod";

export type SqliteQueryFilterValueType = "string" | "number" | "boolean";

export type SqliteQueryFilterFieldAdapter = {
  expression: string;
  valueType: SqliteQueryFilterValueType;
};

export type SqliteQueryFilterAdapter<TKey extends string | number, TEntityKey extends string = string> = {
  entity: TEntityKey;
  fromClause: string;
  keyExpression: string;
  keyAlias: string;
  baseWhereClause?: string;
  fieldAdapters: Record<string, SqliteQueryFilterFieldAdapter>;
  parseKey: (raw: unknown) => TKey;
};

export type SqliteSearchSelectColumn = {
  alias: string;
  expression: string;
};

export type SqliteSearchColumn = SqliteSearchSelectColumn & {
  valueType: SqliteQueryFilterValueType;
  /** Defaults to the alias; `false` makes the selected column unavailable to filters. */
  filterAs?: string | false;
  /** Defaults to the alias; `false` makes the selected column unavailable to sorting. */
  sortAs?: string | false;
};

export type SqliteSearchColumnBindings = {
  fieldAdapters: Record<string, SqliteQueryFilterFieldAdapter>;
  selectColumns: SqliteSearchSelectColumn[];
  sortExpressionsByKey: Record<string, string>;
};

export type CompiledQueryFilterWhere = {
  sql: string;
  params: unknown[];
  filterCount: number;
};

type CompiledClause = { sql: string; params: unknown[] };

const QueryFilterRowSchema = z.object({
  kind: z.enum(["leaf", "relation"]).default("leaf"),
  path: z.string().min(1),
  operator: QueryEngineOperatorSchema.optional(),
  value: z.string().optional(),
  parameterized: z.boolean().optional(),
  selectedOptions: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
});

const QueryFilterPayloadSchema = z.object({
  entity: z.string().optional(),
  rows: z.array(QueryFilterRowSchema).optional(),
});

type QueryFilterRow = z.output<typeof QueryFilterRowSchema>;
type QueryFilterPayload = z.output<typeof QueryFilterPayloadSchema>;

export function bindSqliteSearchColumns(
  columns: readonly SqliteSearchColumn[],
  filterOnlyFields: Record<string, SqliteQueryFilterFieldAdapter> = {},
): SqliteSearchColumnBindings {
  const fieldAdapters: Record<string, SqliteQueryFilterFieldAdapter> = { ...filterOnlyFields };
  const sortExpressionsByKey: Record<string, string> = {};
  const aliases = new Set<string>();

  for (const { alias, expression, valueType, filterAs, sortAs } of columns) {
    if (alias.trim().length === 0) throw new Error("SQLite search column alias must be a non-empty string.");
    if (expression.trim().length === 0) {
      throw new Error(`SQLite search column "${alias}" expression must be a non-empty string.`);
    }
    if (aliases.has(alias)) throw new Error(`SQLite search column alias "${alias}" is registered more than once.`);
    aliases.add(alias);

    if (filterAs !== false) {
      const filterKey = filterAs ?? alias;
      if (fieldAdapters[filterKey]) {
        throw new Error(`SQLite filter field "${filterKey}" is registered more than once.`);
      }
      fieldAdapters[filterKey] = { expression, valueType };
    }
    if (sortAs !== false) sortExpressionsByKey[alias] = sortAs ?? alias;
  }

  return {
    fieldAdapters,
    selectColumns: columns.map(({ alias, expression }) => ({ alias, expression })),
    sortExpressionsByKey,
  };
}

function parseQueryFilterPayload(queryFiltersJson: string | null): QueryFilterPayload | null {
  if (!queryFiltersJson?.trim()) return null;
  try {
    return QueryFilterPayloadSchema.parse(JSON.parse(queryFiltersJson));
  } catch {
    throw new Error("Query filter JSON is invalid.");
  }
}

function toBoundValue(rawValue: string, valueType: SqliteQueryFilterValueType): string | number {
  if (valueType === "string") return rawValue;
  if (valueType === "boolean") {
    const normalized = rawValue.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return 1;
    if (normalized === "false" || normalized === "0") return 0;
    throw new Error(`Invalid boolean filter value: ${rawValue}`);
  }

  const numericValue = Number(rawValue);
  if (!Number.isFinite(numericValue)) throw new Error(`Invalid numeric filter value: ${rawValue}`);
  return numericValue;
}

function splitCommaSeparated(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map(part => part.trim())
    .filter(Boolean);
}

function compileLeafClause(row: QueryFilterRow, field: SqliteQueryFilterFieldAdapter): CompiledClause | null {
  const { expression } = field;
  const operator = row.operator;
  if (!operator || row.parameterized) return null;
  if (operator === "IS_NULL") return { sql: `${expression} IS NULL`, params: [] };
  if (operator === "IS_NOT_NULL") return { sql: `${expression} IS NOT NULL`, params: [] };

  if (operator === "DATE_RANGE") {
    const [from = "", to = ""] = String(row.value ?? "").split("|");
    const clauses: string[] = [];
    const params: unknown[] = [];
    if (from.trim()) {
      clauses.push(`${expression} >= ?`);
      params.push(toBoundValue(from.trim(), field.valueType));
    }
    if (to.trim()) {
      clauses.push(`${expression} <= ?`);
      params.push(toBoundValue(to.trim(), field.valueType));
    }
    return clauses.length > 0 ? { sql: `(${clauses.join(" AND ")})`, params } : null;
  }

  if (operator === "IN") {
    const values = splitCommaSeparated(row.value);
    if (values.length === 0) return null;
    return {
      sql: `${expression} IN (${values.map(() => "?").join(", ")})`,
      params: values.map(value => toBoundValue(value, field.valueType)),
    };
  }

  const rawValue = row.value?.trim();
  if (!rawValue) return null;
  const comparableValue = toBoundValue(rawValue, field.valueType);
  const loweredExpression = `LOWER(COALESCE(CAST(${expression} AS TEXT), ''))`;

  switch (operator) {
    case "EQUALS":
      return { sql: `${expression} = ?`, params: [comparableValue] };
    case "NOT_EQUALS":
      return { sql: `${expression} <> ?`, params: [comparableValue] };
    case "CONTAINS":
      return { sql: `${loweredExpression} LIKE ?`, params: [`%${rawValue.toLowerCase()}%`] };
    case "STARTS_WITH":
      return { sql: `${loweredExpression} LIKE ?`, params: [`${rawValue.toLowerCase()}%`] };
    case "ENDS_WITH":
      return { sql: `${loweredExpression} LIKE ?`, params: [`%${rawValue.toLowerCase()}`] };
    case "GREATER_THAN":
      return { sql: `${expression} > ?`, params: [comparableValue] };
    case "GREATER_OR_EQUAL":
      return { sql: `${expression} >= ?`, params: [comparableValue] };
    case "LESS_THAN":
      return { sql: `${expression} < ?`, params: [comparableValue] };
    case "LESS_OR_EQUAL":
      return { sql: `${expression} <= ?`, params: [comparableValue] };
    default:
      return null;
  }
}

function compileRelationClause(row: QueryFilterRow, field: SqliteQueryFilterFieldAdapter): CompiledClause | null {
  const values = (row.selectedOptions ?? [])
    .map(option => option.value?.trim())
    .filter((value): value is string => Boolean(value));
  if (values.length === 0) return null;
  return {
    sql: `${field.expression} IN (${values.map(() => "?").join(", ")})`,
    params: values.map(value => toBoundValue(value, field.valueType)),
  };
}

export function compileQueryFilterWhere<TKey extends string | number, TEntityKey extends string>(
  adapter: SqliteQueryFilterAdapter<TKey, TEntityKey>,
  queryFiltersJson: string | null,
): CompiledQueryFilterWhere {
  const payload = parseQueryFilterPayload(queryFiltersJson);
  if (payload?.entity && payload.entity !== adapter.entity) {
    throw new Error(`Invalid filter entity. Expected: ${adapter.entity}`);
  }

  const compiled = (Array.isArray(payload?.rows) ? payload.rows : []).flatMap(row => {
    if (!row?.path || row.parameterized) return [];
    const field = adapter.fieldAdapters[row.path];
    if (!field) throw new Error(`Unknown SQLite filter field: ${row.path}`);
    const clause = row.kind === "relation" ? compileRelationClause(row, field) : compileLeafClause(row, field);
    return clause ? [clause] : [];
  });

  return {
    sql: [adapter.baseWhereClause ?? "1 = 1", ...compiled.map(clause => clause.sql)].join(" AND "),
    params: compiled.flatMap(clause => clause.params),
    filterCount: compiled.length,
  };
}

export function compileSearchTextWhere(
  searchText: string | undefined,
  searchExpressions: readonly string[] | undefined,
): CompiledClause | null {
  const normalized = searchText?.trim().toLocaleLowerCase() ?? "";
  if (!normalized || !searchExpressions || searchExpressions.length === 0) return null;
  return {
    sql: `(${searchExpressions
      .map(expression => `LOWER(COALESCE(CAST(${expression} AS TEXT), '')) LIKE ?`)
      .join(" OR ")})`,
    params: searchExpressions.map(() => `%${normalized}%`),
  };
}
