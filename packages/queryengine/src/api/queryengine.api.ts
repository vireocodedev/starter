import {
  createQueryEngineEntitySchemas,
  QueryEngineRelationOptionSchema,
  type QueryEngineEntityDefinition,
  type QueryEngineEntityKey,
  type QueryEngineEntitySummary,
  type QueryEngineRelationOption,
} from "@/models/queryengine.models";
import type z from "zod";

/** Transport-neutral request options — no dependency on a specific HTTP client. */
export type QueryEngineRequestOptions = {
  params?: Record<string, unknown>;
  signal?: AbortSignal;
};

/**
 * Port the query engine needs from its host application. The app injects an
 * adapter (e.g. wrapping its axios client) so this module stays free of any
 * HTTP/infrastructure dependency.
 */
export interface QueryEngineHttpClient {
  /** GET a JSON resource relative to the query-engine base path. Returns raw JSON. */
  get(path: string, options?: QueryEngineRequestOptions): Promise<unknown>;
}

export interface QueryEngineApi {
  listEntities(options?: QueryEngineRequestOptions): Promise<QueryEngineEntitySummary[]>;
  describeEntity(
    entityKey: QueryEngineEntityKey,
    options?: QueryEngineRequestOptions,
  ): Promise<QueryEngineEntityDefinition>;
  listRelationOptions(
    entityKey: QueryEngineEntityKey,
    fieldPath: string,
    searchText?: string,
    options?: QueryEngineRequestOptions,
  ): Promise<QueryEngineRelationOption[]>;
}

export type CreateQueryEngineApiOptions = {
  /** Consumer-owned schema used to validate/normalize entity keys in responses. Defaults to `z.string()`. */
  entityKeySchema?: z.ZodTypeAny;
  /** Optional legacy path key for back-compat retries (return `undefined` when there is none). */
  legacyEntityKey?: (entityKey: QueryEngineEntityKey) => string | undefined;
};

/** Builds a {@link QueryEngineApi} bound to a host-provided HTTP client. */
export function createQueryEngineApi(
  http: QueryEngineHttpClient,
  options?: CreateQueryEngineApiOptions,
): QueryEngineApi {
  const { entityDefinition, entitySummary } = createQueryEngineEntitySchemas(options?.entityKeySchema);
  const legacyEntityKey = options?.legacyEntityKey;

  const getParsed = async <TSchema extends z.ZodTypeAny>(
    path: string,
    schema: TSchema,
    reqOptions?: QueryEngineRequestOptions,
  ): Promise<z.infer<TSchema>> => schema.parse(await http.get(path, reqOptions));

  const describeEntity = async (
    entityKey: QueryEngineEntityKey,
    reqOptions?: QueryEngineRequestOptions,
  ): Promise<QueryEngineEntityDefinition> => {
    try {
      return await getParsed(`entities/${entityKey}`, entityDefinition, reqOptions);
    } catch {
      const legacy = legacyEntityKey?.(entityKey);
      if (legacy === undefined || legacy === entityKey) {
        throw new Error(`Failed to load query engine entity definition for ${entityKey}`);
      }
      return await getParsed(`entities/${legacy}`, entityDefinition, reqOptions);
    }
  };

  const listRelationOptions = async (
    entityKey: QueryEngineEntityKey,
    fieldPath: string,
    searchText?: string,
    reqOptions?: QueryEngineRequestOptions,
  ): Promise<QueryEngineRelationOption[]> => {
    const withSearch: QueryEngineRequestOptions = {
      ...reqOptions,
      params: { ...reqOptions?.params, searchText },
    };

    try {
      return await getParsed(
        `entities/${entityKey}/fields/${fieldPath}/options`,
        QueryEngineRelationOptionSchema.array(),
        withSearch,
      );
    } catch {
      const legacy = legacyEntityKey?.(entityKey);
      if (legacy === undefined || legacy === entityKey) {
        throw new Error(`Failed to load relation options for ${entityKey}.${fieldPath}`);
      }
      return await getParsed(
        `entities/${legacy}/fields/${fieldPath}/options`,
        QueryEngineRelationOptionSchema.array(),
        withSearch,
      );
    }
  };

  return {
    listEntities: reqOptions => getParsed("entities", entitySummary.array(), reqOptions),
    describeEntity,
    listRelationOptions,
  };
}
