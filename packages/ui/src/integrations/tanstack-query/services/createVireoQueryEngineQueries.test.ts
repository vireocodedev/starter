import { createVireoQueryEngineQueries } from "./createVireoQueryEngineQueries";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

describe("createVireoQueryEngineQueries", () => {
  it("creates stable keys and delegates loading to the framework-free API", async () => {
    const api = {
      listEntities: vi.fn().mockResolvedValue([{ key: "customers", filterableFieldCount: 2 }]),
      describeEntity: vi.fn().mockImplementation(async (key: string) => ({ key, title: key, fields: [] })),
      listRelationOptions: vi.fn(),
    };
    const queries = createVireoQueryEngineQueries(api);
    const queryClient = new QueryClient();

    await expect(queryClient.fetchQuery(queries.listEntities())).resolves.toEqual([
      { key: "customers", filterableFieldCount: 2 },
    ]);
    await expect(queryClient.fetchQuery(queries.listEntityDefinitions(["customers", "orders"]))).resolves.toEqual({
      customers: { key: "customers", title: "customers", fields: [] },
      orders: { key: "orders", title: "orders", fields: [] },
    });

    expect(queries.describeEntity("customers").queryKey).toEqual(["queryengineEntityDefinition", "customers"]);
  });
});
