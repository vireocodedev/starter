import {
  createManagedSqliteRuntime,
  createSqliteEntityBundle,
  createSqliteRequestHandlers,
  createSqliteWorkerRuntimeConfig,
} from "@vireocodedev/sqlite";

function captureFailure(run: () => unknown): string {
  try {
    run();
    return "No error was raised.";
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

export async function runFailureSemanticsExample() {
  const disposed = createManagedSqliteRuntime({ workerFactory: () => new Worker("unused.js") });
  disposed.dispose();

  return {
    emptyDatabase: captureFailure(() =>
      createSqliteWorkerRuntimeConfig({ dbFile: " ", migrations: [], entityBundles: [] }),
    ),
    duplicateOperation: captureFailure(() =>
      createSqliteWorkerRuntimeConfig({
        dbFile: "app.sqlite3",
        migrations: [],
        entityBundles: [{ requestHandlers: createSqliteRequestHandlers({ list: () => [] }) }],
        extraRequestHandlers: [createSqliteRequestHandlers({ list: () => [] })],
      }),
    ),
    invalidEntity: captureFailure(() =>
      createSqliteEntityBundle({
        entityNameSingular: "Customer",
        entityNamePlural: "Customers",
        tableName: "customers",
        fields: { name: { column: "name", fromDb: String } },
        requestKeys: { replace: "customers", upsert: "customer", delete: "customerIds" },
      }),
    ),
    disposedRuntime: await disposed
      .send({ type: "list" })
      .catch(error => (error instanceof Error ? error.message : String(error))),
  };
}
