import { type QueryEngineApi } from "@/api/queryengine.api";
import {
  type QueryEngineEntityDefinition,
  type QueryEngineEntityKey,
} from "@/models/queryengine.models";
import { QueryEngineQueryKey } from "@/queryengine.querykeys";
import { sigQueryEngineEntityDefinitions } from "@/signals/sigQueryEngineEntityDefinitions";
import { sigQueryEngineEntitySummaries } from "@/signals/sigQueryEngineEntitySummaries";
import { queryOptions } from "@tanstack/react-query";

/** Builds the query-engine react-query option factories bound to a given api. */
export function createQueryEngineQueries(api: QueryEngineApi) {
  return {
    listEntities: () =>
      queryOptions({
        queryKey: [QueryEngineQueryKey.entities],
        queryFn: async ({ signal }) => {
          const response = await api.listEntities({ signal });
          sigQueryEngineEntitySummaries.value = response;
          return response;
        },
      }),
    listEntityDefinitions: (entityKeys: QueryEngineEntityKey[]) =>
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
    describeEntity: (entityKey: QueryEngineEntityKey) =>
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
