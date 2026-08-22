"use client";

import {
  QueryEngineQueryKey,
  type QueryEngineApi,
  type QueryEngineEntityDefinition,
  type QueryEngineEntityKey,
  type QueryEngineEntitySummary,
} from "@vireocodedev/starter-queryengine";
import {
  queryOptions,
  type DataTag,
  type OmitKeyof,
  type QueryFunction,
  type UseQueryOptions,
} from "@tanstack/react-query";

type VireoQueryEngineQueryOptions<TData, TQueryKey extends readonly unknown[]> = OmitKeyof<
  UseQueryOptions<TData, Error, TData, TQueryKey>,
  "queryFn"
> & {
  queryFn?: QueryFunction<TData, TQueryKey, never>;
} & { queryKey: DataTag<TQueryKey, TData, Error> };

/** Creates React Query options for the framework-free QueryEngine API. */
export function createVireoQueryEngineQueries(api: QueryEngineApi) {
  return {
    listEntities: (): VireoQueryEngineQueryOptions<
      QueryEngineEntitySummary[],
      (typeof QueryEngineQueryKey.entities)[]
    > =>
      queryOptions({
        queryKey: [QueryEngineQueryKey.entities],
        queryFn: ({ signal }) => api.listEntities({ signal }),
      }),
    listEntityDefinitions: (
      entityKeys: QueryEngineEntityKey[],
    ): VireoQueryEngineQueryOptions<Partial<Record<QueryEngineEntityKey, QueryEngineEntityDefinition>>, string[]> =>
      queryOptions({
        queryKey: [QueryEngineQueryKey.entityDefinitions, ...entityKeys],
        queryFn: async ({ signal }) => {
          const definitions = await Promise.all(entityKeys.map(entityKey => api.describeEntity(entityKey, { signal })));
          return definitions.reduce<Partial<Record<QueryEngineEntityKey, QueryEngineEntityDefinition>>>(
            (byEntityKey, definition) => {
              byEntityKey[definition.key] = definition;
              return byEntityKey;
            },
            {},
          );
        },
      }),
    describeEntity: (
      entityKey: QueryEngineEntityKey,
    ): VireoQueryEngineQueryOptions<QueryEngineEntityDefinition, string[]> =>
      queryOptions({
        queryKey: [QueryEngineQueryKey.entityDefinition, entityKey],
        queryFn: ({ signal }) => api.describeEntity(entityKey, { signal }),
      }),
  };
}

export type VireoQueryEngineQueries = ReturnType<typeof createVireoQueryEngineQueries>;
