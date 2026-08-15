import { type PageableParams, type PageableResponse } from "@/http/pagedSearch";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

export type PagedSearchRequestOptions = {
  signal?: AbortSignal;
};

export type PagedSearchQueryPolicy = {
  staleTime: number;
  refetchOnMount: boolean;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
};

export function createPagedSearchQuery<TFilters, TResult extends PageableResponse<unknown>>(args: {
  queryKeyRoot: string;
  searchFn: (pagination: PageableParams, filters: TFilters, request?: PagedSearchRequestOptions) => Promise<TResult>;
  policy: PagedSearchQueryPolicy;
}) {
  const { queryKeyRoot, searchFn, policy } = args;

  return {
    search: (pagination: PageableParams, filters: TFilters) =>
      queryOptions({
        queryKey: [queryKeyRoot, pagination, filters],
        queryFn: async ({ signal }) => searchFn(pagination, filters, { signal }),
        ...policy,
      }),
    searchInfinite: (pagination: PageableParams, filters: TFilters) =>
      infiniteQueryOptions({
        queryKey: [queryKeyRoot, "infinite", pagination, filters],
        queryFn: async ({ pageParam, signal }) =>
          await searchFn({ ...pagination, page: Number(pageParam) }, filters, { signal }),
        initialPageParam: 0,
        getNextPageParam: (lastPage: TResult) =>
          lastPage.number + 1 < lastPage.totalPages ? lastPage.number + 1 : undefined,
        ...policy,
      }),
  };
}
