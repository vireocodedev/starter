import { createQueryEngineApi, type QueryEngineHttpClient } from "@vireocodedev/query";
import z from "zod";

const entityKeySchema = z.enum(["CUSTOMER", "ORDER"]);

const responses: Record<string, unknown> = {
  entities: [
    { key: "CUSTOMER", filterableFieldCount: 2 },
    { key: "ORDER", filterableFieldCount: 3 },
  ],
  "entities/CUSTOMER": { key: "CUSTOMER", title: "Customers", fields: [] },
};

const transport: QueryEngineHttpClient = {
  get: path => Promise.resolve(responses[path]),
};

export async function runPrimaryWorkflowExample() {
  const api = createQueryEngineApi(transport, { entityKeySchema });

  return {
    entities: await api.listEntities(),
    customer: await api.describeEntity("CUSTOMER"),
  };
}
