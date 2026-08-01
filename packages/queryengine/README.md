# @vireocodedev/starter-queryengine

Framework-agnostic **query engine client** for the vireocodedev **starter**
product: typed models + zod schemas, an injectable HTTP-port API, a react-query
layer, and shared signals.

The engine is **generic over entity keys** (opaque strings) and **transport-
agnostic** (you inject an HTTP client). No app/domain specifics live here.

## Install

Published to **GitHub Packages** under the `@vireocodedev` scope (see the
localization package README for `.npmrc` setup):

```bash
npm install @vireocodedev/starter-queryengine
```

Peers: `react`, `zod`, `@tanstack/react-query`, `@preact/signals-react`. All
peers must resolve to a single instance in the app.

The `queryengine` translation namespace lives in
`@vireocodedev/starter-localization` — install it alongside this package if you
render the query-engine UI.

## Wiring (host application)

Inject an HTTP adapter and your own entity-key set; keep both in the app:

```ts
import {
  createQueryEngineApi,
  createQueryEngineQueries,
  type QueryEngineHttpClient,
} from "@vireocodedev/starter-queryengine";

class QueryEngineHttpAdapter implements QueryEngineHttpClient {
  get(path, options) {
    /* call your axios/fetch client, return raw JSON */
  }
}

export const queryEngineApi = createQueryEngineApi(new QueryEngineHttpAdapter(), {
  entityKeySchema: AppEntityKeyCompatSchema, // your enum + normalization
  legacyEntityKey: toLegacyAppEntityKey, // optional back-compat retry
});
export const QueryEngineQuery = createQueryEngineQueries(queryEngineApi);
```

## i18n

The `queryengine` namespace is **owned by
`@vireocodedev/starter-localization`**, so a single package ships every starter
translation:

```ts
import { createStarterResources, useQueryEngineTranslation } from "@vireocodedev/starter-localization";

const starter = createStarterResources({ locales: ["en", "hr"] });
// spread starter.en / starter.hr into your i18next resources
```

Augment i18next with the `queryengine` namespace:

```ts
import type { QueryEngineResources } from "@vireocodedev/starter-localization";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: { queryengine: QueryEngineResources };
  }
}
```

## Public API (high level)

- **Models:** `QueryEngineEntityKey` (string), `QueryEngineOperator`,
  `QueryEngineFieldType`, `QueryEngine{Field,Entity}Definition`,
  `QueryEngineEntitySummary`, `QueryEngineRelationOption`,
  `createQueryEngineEntitySchemas`, operator/field-type/relation-mode schemas.
- **API:** `createQueryEngineApi`, `QueryEngineApi`, `QueryEngineHttpClient`,
  `QueryEngineRequestOptions`, `CreateQueryEngineApiOptions`.
- **Queries:** `createQueryEngineQueries`, `QueryEngineQueries`, `QueryEngineQueryKey`.
- **Signals:** `sigQueryEngineEntityDefinitions`, `sigQueryEngineEntitySummaries`.

> **i18n moved.** `useQueryEngineTranslation`, `createQueryEngineResources`,
> `queryEngineBaseResources`, `QUERYENGINE_TRANSLATION_NAMESPACE` and the
> `QueryEngineResources` types are now exported by
> `@vireocodedev/starter-localization`.

## Versioning contract

Operator/field-type/relation-mode sets are a contract (add = minor,
remove/rename = major), guarded by the contract test. The `queryengine`
translation key surface is guarded in `@vireocodedev/starter-localization`.
