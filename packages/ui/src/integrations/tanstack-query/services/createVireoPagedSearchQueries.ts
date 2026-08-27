import type { PageableParams, PageableResponse } from "@vireocodedev/infrastructure/pagination";
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

export type VireoPagedSearchRequestOptions = {
  signal?: AbortSignal;
};

export type VireoPagedSearchQueryPolicy = {
  staleTime: number;
  refetchOnMount: boolean;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
};

type VireoPagedSearchQueryKey<TFilters> = (string | PageableParams | TFilters)[];

/**
 * Named public-consumer shape for `queryOptions`.
 *
 * Without this annotation, declaration emit expands TanStack Query's `DataTag`
 * into references to private unique symbols that strict consumers cannot name.
 */
type VireoPagedSearchQueryOptions<TFilters, TResult> = OmitKeyof<
  UseQueryOptions<TResult, Error, TResult, VireoPagedSearchQueryKey<TFilters>>,
  "queryFn"
> & {
  queryFn?: QueryFunction<TResult, VireoPagedSearchQueryKey<TFilters>, never>;
  queryKey: DataTag<VireoPagedSearchQueryKey<TFilters>, TResult, Error>;
};

/** Named public-consumer shape for `infiniteQueryOptions`. */
type VireoPagedSearchInfiniteQueryOptions<TFilters, TResult> = OmitKeyof<
  UseInfiniteQueryOptions<TResult, Error, InfiniteData<TResult, unknown>, VireoPagedSearchQueryKey<TFilters>, number>,
  "queryFn"
> & {
  queryFn?: QueryFunction<TResult, VireoPagedSearchQueryKey<TFilters>, number>;
  queryKey: DataTag<VireoPagedSearchQueryKey<TFilters>, InfiniteData<TResult, unknown>, Error>;
};

export function createVireoPagedSearchQueries<TFilters, TResult extends PageableResponse<unknown>>(args: {
  queryKeyRoot: string;
  searchFn: (
    pagination: PageableParams,
    filters: TFilters,
    request?: VireoPagedSearchRequestOptions,
  ) => Promise<TResult>;
  policy: VireoPagedSearchQueryPolicy;
}) {
  const { queryKeyRoot, searchFn, policy } = args;

  return {
    search: (pagination: PageableParams, filters: TFilters): VireoPagedSearchQueryOptions<TFilters, TResult> =>
      queryOptions({
        queryKey: [queryKeyRoot, pagination, filters],
        queryFn: async ({ signal }) => searchFn(pagination, filters, { signal }),
        ...policy,
      }),
    searchInfinite: (
      pagination: PageableParams,
      filters: TFilters,
    ): VireoPagedSearchInfiniteQueryOptions<TFilters, TResult> =>
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
