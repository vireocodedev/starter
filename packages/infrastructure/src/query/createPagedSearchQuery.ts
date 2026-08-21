import { type PageableParams, type PageableResponse } from "@/http/pagedSearch";
import {
  type DataTag,
  type InfiniteData,
  infiniteQueryOptions,
  type OmitKeyof,
  type QueryFunction,
  queryOptions,
  type UseInfiniteQueryOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

export type PagedSearchRequestOptions = {
  signal?: AbortSignal;
};

export type PagedSearchQueryPolicy = {
  staleTime: number;
  refetchOnMount: boolean;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
};

type PagedSearchQueryKey<TFilters> = (string | PageableParams | TFilters)[];

/**
 * Named public-consumer shape for `queryOptions`.
 *
 * Without this annotation, declaration emit expands TanStack Query's `DataTag`
 * into references to private unique symbols that strict consumers cannot name.
 */
type PagedSearchQueryOptions<TFilters, TResult> = OmitKeyof<
  UseQueryOptions<TResult, Error, TResult, PagedSearchQueryKey<TFilters>>,
  "queryFn"
> & {
  queryFn?: QueryFunction<TResult, PagedSearchQueryKey<TFilters>, never>;
  queryKey: DataTag<PagedSearchQueryKey<TFilters>, TResult, Error>;
};

/** Named public-consumer shape for `infiniteQueryOptions`. */
type PagedSearchInfiniteQueryOptions<TFilters, TResult> = OmitKeyof<
  UseInfiniteQueryOptions<TResult, Error, InfiniteData<TResult, unknown>, PagedSearchQueryKey<TFilters>, number>,
  "queryFn"
> & {
  queryFn?: QueryFunction<TResult, PagedSearchQueryKey<TFilters>, number>;
  queryKey: DataTag<PagedSearchQueryKey<TFilters>, InfiniteData<TResult, unknown>, Error>;
};

export function createPagedSearchQuery<TFilters, TResult extends PageableResponse<unknown>>(args: {
  queryKeyRoot: string;
  searchFn: (pagination: PageableParams, filters: TFilters, request?: PagedSearchRequestOptions) => Promise<TResult>;
  policy: PagedSearchQueryPolicy;
}) {
  const { queryKeyRoot, searchFn, policy } = args;

  return {
    search: (pagination: PageableParams, filters: TFilters): PagedSearchQueryOptions<TFilters, TResult> =>
      queryOptions({
        queryKey: [queryKeyRoot, pagination, filters],
        queryFn: async ({ signal }) => searchFn(pagination, filters, { signal }),
        ...policy,
      }),
    searchInfinite: (
      pagination: PageableParams,
      filters: TFilters,
    ): PagedSearchInfiniteQueryOptions<TFilters, TResult> =>
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
