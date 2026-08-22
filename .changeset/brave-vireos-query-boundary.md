---
"@vireocodedev/starter-ui": major
---

Add `VireoQueryBoundary` to the `/tanstack-query` integration with local Suspense, error, retry, reset-key, slot, theme, and opt-in diagnostic-details contracts. Remove `configureQueryClient`, `RgoQueryOptionsFactoryCollection`, `RgoQueryClientProvider`, `RgoQueryErrorLoaderSuspense`, `RgoQueryErrorBoundary`, and `RgoLoaderSuspense`; use native TanStack Query providers and primitives when the Vireo boundary is not appropriate.
