# Adapters and company APIs

Adapters let the Vireo UI depend on stable application capabilities while each organization retains its transport, identity and backend ownership model.

## Available slots

The template exposes slots for:

- Authentication and session identity
- Item query and CRUD operations
- Query-field metadata
- History retrieval

Mock and HTTP implementations use the same narrow contracts. Tests can replace a slot without changing pages or package source.

## Configure once at composition time

```ts
import { configureAppAdapters } from "@/app/adapters/public";

configureAppAdapters({
  auth: companyAuthAdapter,
  items: companyItemAdapter,
  query: companyQueryAdapter,
  history: companyHistoryAdapter,
});
```

Configuration belongs near application startup. Feature components should consume the configured capability rather than choose transports dynamically.

## Translate at the edge

A company adapter may:

- Add OAuth or session credentials.
- Map API pagination and filter formats.
- Convert backend error envelopes into application errors.
- Preserve exact money, temporal and identifier semantics.
- Attach tracing headers.

It should not duplicate backend domain validation or silently weaken authorization failures.

## Develop independently

The mock mode gives frontend teams a deterministic workflow before a backend environment exists. Keep mock examples aligned with reviewed API contracts, then run a separate integration lane with `VITE_API_MODE=http` against the real service.

Contract fixtures are useful, but only the real integration lane proves authentication, proxy, CORS, serialization and environment configuration.

## Add a company-specific adapter

1. Define the company API response and error types at the adapter edge.
2. Implement the Vireo application contract.
3. Add contract tests for mapping and failure behavior.
4. Configure the adapter in application composition.
5. Exercise one real environment before expanding adoption.

See [Frontend-only applications](/docs/getting-started/frontend-only/) and [Wire contracts](/docs/concepts/wire-contracts/).
