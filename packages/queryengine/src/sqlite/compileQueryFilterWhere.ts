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

type QueryFilterRelationOption = { value: string; label: string };
type QueryFilterOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "CONTAINS"
  | "STARTS_WITH"
  | "ENDS_WITH"
  | "IN"
  | "GREATER_THAN"
  | "GREATER_OR_EQUAL"
  | "LESS_THAN"
  | "LESS_OR_EQUAL"
  | "DATE_RANGE"
  | "IS_NULL"
  | "IS_NOT_NULL";

type QueryFilterRow = {
  kind: "leaf" | "relation";
  path: string;
  operator?: QueryFilterOperator;
  value?: string;
  parameterized?: boolean;
  selectedOptions?: QueryFilterRelationOption[];
};

type QueryFilterPayload = { entity?: string; rows?: QueryFilterRow[] };
type CompiledClause = { sql: string; params: unknown[] };

export function bindSqliteSearchColumns(
  columns: readonly SqliteSearchColumn[],
  filterOnlyFields: Record<string, SqliteQueryFilterFieldAdapter> = {},
): SqliteSearchColumnBindings {
  const fieldAdapters: Record<string, SqliteQueryFilterFieldAdapter> = { ...filterOnlyFields };
  const sortExpressionsByKey: Record<string, string> = {};

  for (const { alias, expression, valueType, filterAs, sortAs } of columns) {
    if (filterAs !== false) fieldAdapters[filterAs ?? alias] = { expression, valueType };
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
    return JSON.parse(queryFiltersJson) as QueryFilterPayload;
  } catch {
    return null;
  }
}

function toBoundValue(rawValue: string, valueType: SqliteQueryFilterValueType): string | number {
  if (valueType === "string") return rawValue;
  if (valueType === "boolean") return rawValue.trim().toLowerCase() === "true" ? 1 : 0;

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
    if (!field) return [];
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
