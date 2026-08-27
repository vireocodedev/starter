import {
  bindSqliteSearchColumns,
  compileQueryFilterWhere,
  createQueryEngineEntitySchemas,
  type SqliteQueryFilterAdapter,
} from "@vireocodedev/query";

function captureFailure(run: () => unknown): string {
  try {
    run();
    return "No error was raised.";
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

const adapter: SqliteQueryFilterAdapter<number> = {
  entity: "customer",
  fromClause: "customer",
  keyExpression: "customer.id",
  keyAlias: "id",
  fieldAdapters: { name: { expression: "customer.name", valueType: "string" } },
  parseKey: Number,
};

export function runFailureSemanticsExample() {
  const schemas = createQueryEngineEntitySchemas();

  return {
    malformedFilter: captureFailure(() => compileQueryFilterWhere(adapter, "{not-json")),
    unknownFilter: captureFailure(() =>
      compileQueryFilterWhere(
        adapter,
        JSON.stringify({
          entity: "customer",
          rows: [{ kind: "leaf", path: "unknown", operator: "EQUALS", value: "x" }],
        }),
      ),
    ),
    duplicateColumn: captureFailure(() =>
      bindSqliteSearchColumns([
        { alias: "name", expression: "customer.name", valueType: "string" },
        { alias: "name", expression: "customer.display_name", valueType: "string" },
      ]),
    ),
    invalidSummary: captureFailure(() => schemas.entitySummary.parse({ key: "", filterableFieldCount: -1 })),
  };
}
