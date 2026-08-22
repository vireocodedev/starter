import {
  bindSqliteSearchColumns,
  compileQueryFilterWhere,
  compileSearchTextWhere,
  type SqliteQueryFilterAdapter,
} from "@vireocodedev/starter-queryengine";

const columns = bindSqliteSearchColumns([
  { alias: "name", expression: "customer.name", valueType: "string" },
  { alias: "active", expression: "customer.active", valueType: "boolean" },
]);

const adapter: SqliteQueryFilterAdapter<number> = {
  entity: "customer",
  fromClause: "customer",
  keyExpression: "customer.id",
  keyAlias: "id",
  baseWhereClause: "customer.deleted = 0",
  fieldAdapters: columns.fieldAdapters,
  parseKey: Number,
};

export function runFilterCompilationExample() {
  const filters = compileQueryFilterWhere(
    adapter,
    JSON.stringify({
      entity: "customer",
      rows: [
        { kind: "leaf", path: "active", operator: "EQUALS", value: "true" },
        { kind: "leaf", path: "name", operator: "CONTAINS", value: "Northstar" },
      ],
    }),
  );
  const search = compileSearchTextWhere(" Zagreb ", ["customer.name", "customer.city"]);

  return { columns, filters, search };
}
