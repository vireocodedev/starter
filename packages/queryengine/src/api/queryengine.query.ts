import { type QueryEngineApi } from "@/api/queryengine.api";
import {
  type QueryEngineEntityDefinition,
  type QueryEngineEntityKey,
  type QueryEngineEntitySummary,
} from "@/models/queryengine.models";
import { QueryEngineQueryKey } from "@/queryengine.querykeys";
import { sigQueryEngineEntityDefinitions } from "@/signals/sigQueryEngineEntityDefinitions";
import { sigQueryEngineEntitySummaries } from "@/signals/sigQueryEngineEntitySummaries";
import {
  queryOptions,
  type DataTag,
  type OmitKeyof,
  type QueryFunction,
  type UseQueryOptions,
} from "@tanstack/react-query";

/**
 * The shape `queryOptions` returns, written out by hand.
 *
 * Left to inference, TypeScript expands the `DataTag` brand that `queryOptions`
 * puts on `queryKey` into a structural type whose keys are the two
 * `unique symbol`s `@tanstack/query-core` declares privately. The emitted
 * `.d.ts` then references `dataTagSymbol` and `dataTagErrorSymbol` as bare
 * identifiers that nothing brings into scope, so every consumer compiling with
 * `skipLibCheck: false` fails on our declarations.
 *
 * Naming the alias here gives the declaration emitter something it can print by
 * reference instead of by expansion, and keeps the brand — which is what lets
 * `queryClient.getQueryData(...)` infer its result.
 */
type QueryEngineQueryOptions<TData, TQueryKey extends readonly unknown[]> = OmitKeyof<
  UseQueryOptions<TData, Error, TData, TQueryKey>,
  "queryFn"
> & {
  queryFn?: QueryFunction<TData, TQueryKey, never>;
} & { queryKey: DataTag<TQueryKey, TData, Error> };

/** Builds the query-engine react-query option factories bound to a given api. */
export function createQueryEngineQueries(api: QueryEngineApi) {
  return {
    listEntities: (): QueryEngineQueryOptions<QueryEngineEntitySummary[], (typeof QueryEngineQueryKey.entities)[]> =>
      queryOptions({
        queryKey: [QueryEngineQueryKey.entities],
        queryFn: async ({ signal }) => {
          const response = await api.listEntities({ signal });
          sigQueryEngineEntitySummaries.value = response;
          return response;
        },
      }),
    listEntityDefinitions: (
      entityKeys: QueryEngineEntityKey[],
    ): QueryEngineQueryOptions<Partial<Record<QueryEngineEntityKey, QueryEngineEntityDefinition>>, string[]> =>
      queryOptions({
        queryKey: [QueryEngineQueryKey.entityDefinitions, ...entityKeys],
        queryFn: async ({ signal }) => {
          if (entityKeys.length === 0) {
            sigQueryEngineEntityDefinitions.value = {};
            return {} as Partial<Record<QueryEngineEntityKey, QueryEngineEntityDefinition>>;
          }

          const definitions = await Promise.all(entityKeys.map(entityKey => api.describeEntity(entityKey, { signal })));
          const byEntityKey = definitions.reduce<Partial<Record<QueryEngineEntityKey, QueryEngineEntityDefinition>>>(
            (acc, definition) => {
              acc[definition.key] = definition;
              return acc;
            },
            {},
          );

          sigQueryEngineEntityDefinitions.value = byEntityKey;
          return byEntityKey;
        },
      }),
    describeEntity: (entityKey: QueryEngineEntityKey): QueryEngineQueryOptions<QueryEngineEntityDefinition, string[]> =>
      queryOptions({
        queryKey: [QueryEngineQueryKey.entityDefinition, entityKey],
        queryFn: async ({ signal }) => {
          const cached = sigQueryEngineEntityDefinitions.value[entityKey];
          if (cached) {
            return cached;
          }

          const definition = await api.describeEntity(entityKey, { signal });
          sigQueryEngineEntityDefinitions.value = {
            ...sigQueryEngineEntityDefinitions.value,
            [definition.key]: definition,
          };
          return definition;
        },
      }),
  };
}

export type QueryEngineQueries = ReturnType<typeof createQueryEngineQueries>;
