import { createSqliteEntityBundle, createSqliteWorkerRuntimeConfig } from "@vireocodedev/starter-sqlite";

const customers = createSqliteEntityBundle({
  entityNameSingular: "Customer",
  entityNamePlural: "Customers",
  tableName: "customers",
  fields: {
    id: { column: "customer_id", id: true, fromDb: value => String(value) },
    name: { column: "name", fromDb: value => String(value) },
    active: { column: "active", fromDb: value => Number(value) === 1, toDb: value => (value ? 1 : 0) },
  },
  keywordFields: ["name"],
  requestKeys: { replace: "customers", upsert: "customer", delete: "customerIds" },
});

export function runPrimaryWorkflowExample() {
  const config = createSqliteWorkerRuntimeConfig({
    dbFile: "vireo.sqlite3",
    migrations: [db => db.exec("CREATE TABLE customers (...);")],
    entityBundles: [customers],
  });

  return {
    database: config.dbFile,
    migrationCount: config.migrations.length,
    operations: customers.operationNames,
    workerHandlers: Object.keys(config.requestHandlers),
  };
}
