import { postPagedSearch, resolveHttpEndpoint, type PageableResponse } from "@vireocodedev/starter-infrastructure";
import type { AxiosInstance } from "axios";
import z from "zod";

const customerSchema = z.object({ id: z.number(), name: z.string() });

export async function runHttpPaginationExample() {
  const transport = {
    post: async () => ({
      data: {
        content: [{ id: 1, name: "Northstar Analytics" }],
        number: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      } satisfies PageableResponse<unknown>,
    }),
  } as Pick<AxiosInstance, "post">;

  const page = await postPagedSearch({
    client: transport,
    endpointName: "customers",
    schema: customerSchema,
    pageable: { page: 0, rowsPerPage: 20, sortBy: "name", sortDirection: "asc" },
    filters: {
      searchText: "northstar",
      queryFiltersJson: JSON.stringify({ rows: [{ field: "status", value: "active" }] }),
    },
  });

  return { endpoint: resolveHttpEndpoint("customers", "search"), page };
}
