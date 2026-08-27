import { createQueryEngineConfigClient } from "@vireocodedev/query";

export async function runConfigPersistenceExample() {
  let clearFallback: () => void = () => undefined;
  const client = createQueryEngineConfigClient({
    runtime: {
      shouldUseInMemoryFallback: () => true,
      registerInMemoryStore: store => {
        clearFallback = store.clear;
        return () => undefined;
      },
    },
    transport: { sendRequest: () => Promise.reject(new Error("Transport is not used in fallback mode.")) },
  });

  await client.replace({
    entities: [{ key: "CUSTOMER", filterableFieldCount: 2 }],
    entityDefinitions: { CUSTOMER: { key: "CUSTOMER", title: "Customers", fields: [] } },
  });
  const beforeClear = await client.get();
  clearFallback();
  const afterClear = await client.get();
  client.dispose();

  return { beforeClear, afterClear };
}
