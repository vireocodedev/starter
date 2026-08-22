import { type PageableParams, type PageableResponse } from "@vireocodedev/starter-infrastructure/pagination";
import { createVireoPagedSearchQueries, type VireoPagedSearchRequestOptions } from "./createVireoPagedSearchQueries";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

type Row = { id: number };
type Filters = { searchText: string };
const PAGEABLE: PageableParams = { page: 0, rowsPerPage: 2, sortBy: "id", sortDirection: "asc" };
const POLICY = {
  staleTime: 30_000,
  refetchOnMount: true,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

function page(number: number, totalPages: number): PageableResponse<Row> {
  return { content: [{ id: number }], number, size: 2, totalElements: totalPages * 2, totalPages };
}

describe("createVireoPagedSearchQueries", () => {
  it("builds a finite query with stable keys, policy, and a neutral abort request", async () => {
    const searchFn = vi.fn(
      async (pageable: PageableParams, filters: Filters, request?: VireoPagedSearchRequestOptions) => {
        void pageable;
        void filters;
        void request;
        return page(0, 1);
      },
    );
    const options = createVireoPagedSearchQueries({ queryKeyRoot: "rows", searchFn, policy: POLICY }).search(PAGEABLE, {
      searchText: "needle",
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    await expect(client.fetchQuery(options)).resolves.toEqual(page(0, 1));
    expect(options.queryKey).toEqual(["rows", PAGEABLE, { searchText: "needle" }]);
    expect(searchFn).toHaveBeenCalledWith(PAGEABLE, { searchText: "needle" }, { signal: expect.any(AbortSignal) });
  });

  it("advances infinite pages until the response reports its final page", async () => {
    const searchFn = vi.fn(async (pageable: PageableParams, filters: Filters) => {
      void filters;
      return page(pageable.page, 3);
    });
    const options = createVireoPagedSearchQueries({ queryKeyRoot: "rows", searchFn, policy: POLICY }).searchInfinite(
      PAGEABLE,
      { searchText: "" },
    );
    const signal = new AbortController().signal;

    await expect(options.queryFn?.({ pageParam: 2, signal } as never)).resolves.toEqual(page(2, 3));
    expect(searchFn).toHaveBeenCalledWith({ ...PAGEABLE, page: 2 }, { searchText: "" }, { signal });
    expect(options.getNextPageParam?.(page(0, 3), [page(0, 3)], 0, [0])).toBe(1);
    expect(options.getNextPageParam?.(page(2, 3), [page(2, 3)], 2, [2])).toBeUndefined();
  });
});
