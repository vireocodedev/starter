import {
  createHydrationContributorRegistry,
  createHydrationGate,
  createHydrationRequestQueue,
  createHydrationStatus,
} from "@vireocodedev/sqlite";

export async function runHydrationStateExample() {
  const registry = createHydrationContributorRegistry();
  const gate = createHydrationGate({ now: () => 1_000 });
  const status = createHydrationStatus({ now: () => 1_000 });
  const requests = createHydrationRequestQueue();

  registry.register([
    { key: "products", hydrate: async () => ({ rowCount: 24 }) },
    { key: "customers", hydrate: async () => ({ rowCount: 8 }) },
  ]);
  status.registerEntities(registry.list().map(item => item.key));
  gate.start();
  status.markRunning(true);
  status.markEntitySuccess("customers", 8);

  const request = requests.request(["products", "products", " "]);
  const batch = requests.consume();
  requests.settle(batch, new Set());
  await request;

  gate.markDataReady();
  gate.finish();
  status.markRunning(false);

  return {
    contributors: registry.list().map(item => item.key),
    forcedKeys: [...batch.forcedKeys],
    gate: gate.getSnapshot(),
    status: status.getSnapshot(),
  };
}
