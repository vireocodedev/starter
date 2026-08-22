# @vireocodedev/starter-queryengine

Framework-free query metadata, transport ports, filter compilation, and parameterized SQLite execution for Vireo Starter.

The package owns reusable query contracts. An application still owns its entity-key vocabulary, HTTP implementation, database schema, SQL expressions, authorization, cache lifecycle, and product UI.

## Install

```bash
npm install @vireocodedev/starter-queryengine zod
```

The sole peer dependency is Zod 3. The root entry point is React-free, browser-global-free, and worker-safe.

React Query integration lives in `@vireocodedev/starter-ui/tanstack-query`:

```bash
npm install @vireocodedev/starter-ui @tanstack/react-query
```

## Public architecture

```text
application transport
  -> createQueryEngineApi
  -> Zod-validated entity metadata
  -> application cache or createVireoQueryEngineQueries
  -> query-filter JSON
  -> compileQueryFilterWhere / compileSearchTextWhere
  -> createSqliteQueryExecutor
  -> application-owned SQLite worker port
```

There are no package-global signals or caches. Every API, executor, and config client is instance-scoped.

## Entity metadata and API

`createQueryEngineEntitySchemas` builds recursive Zod schemas from an optional application-owned entity-key schema. The default accepts any non-empty string, keeping this package generic while rejecting unusable identifiers.

`createQueryEngineApi` accepts a minimal `get(path, options)` port. It validates all responses, encodes dynamic path segments, forwards abort signals, preserves transport and Zod failures, and can optionally retry an application-provided legacy entity key.

```ts
import { createQueryEngineApi } from "@vireocodedev/starter-queryengine";
import z from "zod";

const api = createQueryEngineApi(fetchAdapter, {
  entityKeySchema: z.enum(["CUSTOMER", "ORDER"]),
  legacyEntityKey: key => (key === "CUSTOMER" ? "customer" : undefined),
});
```

## Filter compilation

`bindSqliteSearchColumns` creates one explicit registry for selectable columns, filter fields, and sort expressions. `compileQueryFilterWhere` compiles supported operators into SQL placeholders plus bound values. `compileSearchTextWhere` does the same for free-text search.

The compiler fails closed. Malformed JSON, a mismatched entity, unknown fields, duplicate bindings, and invalid typed values throw instead of silently removing restrictions.

Application-authored SQL expressions remain trusted configuration. Runtime filter/search values are always returned separately as parameters.

## SQLite execution

`createSqliteQueryExecutor` provides paged searches, optional count probing, concurrent-request deduplication, matching-key lookup, timing hooks, and deterministic row mapping over injected execution ports.

`executeParameterizedSqliteQuery` and `executeParameterizedSqlitePagedQuery` are worker-side helpers. Pagination is normalized to whole rows before transport and validated again before interpolation into SQL.

## Config persistence

`createQueryEngineConfigClient` owns instance-local in-memory fallback state and an injected request transport. `createQueryEngineConfigSqliteRequestHandlers`, `replaceQueryEngineConfig`, and `getQueryEngineConfig` provide the worker-side persistence boundary.

Table identifiers, singleton keys, request names, snapshot shape, and persisted JSON are validated. Corrupt storage is reported explicitly and never replaced with an empty configuration.

## React Query integration

The optional React adapter belongs to Starter UI because it imports React Query:

```ts
import { createVireoQueryEngineQueries } from "@vireocodedev/starter-ui/tanstack-query";

export const QueryEngineQueries = createVireoQueryEngineQueries(api);
```

The adapter creates stable query options without mutating global signals. Applications remain free to use another cache or the framework-free API directly.

## Failure semantics

- Invalid API response data raises the original Zod error.
- Transport failures remain transport failures when no legacy retry applies.
- Aborted requests are never retried.
- Invalid filter contracts fail closed before SQL execution.
- Invalid pagination fails before a statement is prepared.
- Invalid SQLite config identifiers fail synchronously.
- Malformed or shape-incompatible persisted config raises an error.
- Duplicate request and filter registrations are rejected.

## Verification and live documentation

Package tests cover public schemas, API paths and failures, filter compilation, pagination, config persistence, concurrency, and framework boundaries. The unified Vireo Storybook contains executable examples under **Query Engine**; every displayed source file is the same TypeScript module Storybook executes.
