# @vireocodedev/starter-infrastructure

React-free browser infrastructure primitives for validated HTTP transport, connectivity, persistent state, session-expiry coordination, and execution-mode-aware services.

The package owns reusable mechanisms. Applications still own configured transports, endpoint vocabulary, authentication and routing, heartbeat adapters, persistence services, query caching, service-worker lifecycle, and product UI.

## Install

```bash
npm install @vireocodedev/starter-infrastructure axios zod @preact/signals-core
```

The package name is stable; registry selection and authentication belong to the
consumer's approved release-channel configuration and are intentionally not
embedded here. TypeScript declarations are verified from the packed artifact
with TypeScript 6, `moduleResolution: "Bundler"`, and `skipLibCheck: false`.
Relative source maps with embedded source content are published intentionally
for debugging.

The package has no React, MUI, React Query, locale, or application singleton dependency.

React adapters live in Starter UI:

```ts
import { useVireoOnlineStatus } from "@vireocodedev/starter-ui";
import { createVireoPagedSearchQueries } from "@vireocodedev/starter-ui/tanstack-query";
```

## Public architecture

```text
application runtime and policy
  -> createConnectivityState / getAppOnlineStatus
  -> createModeAwareApi
  -> AxiosHttpClient or postPagedSearch
  -> Zod-validated response data
  -> application cache and product state

application storage -> createPersistentSignal
application authentication -> createSessionExpiryChannel
```

All stateful factories are instance-scoped. Importing the package creates no query client, listeners, timers, session state, or storage state.

## Mode-aware services

`createModeAwareApi` composes online and offline service modules behind one application API. The application injects the current mode, guards, fallback classification, timing, and diagnostics policy. `transactional` can mark offline methods whose writes should prefer the online implementation while connectivity exists.

## HTTP and pagination

`AxiosHttpClient` centralizes injected Axios transport and Zod response validation. `postPagedSearch` validates the complete pageable envelope, not only its rows. Malformed filter JSON and invalid metadata fail closed.

`sanitizeAxiosError` produces a deliberately small diagnostic object and never exposes request bodies, headers, query strings, or response data.

## Connectivity

`getAppOnlineStatus` and `subscribeToAppNetworkStatus` expose the browser's lightweight network hint. `createConnectivityState` combines that hint with optional heartbeat freshness and explicit backend availability. Runtime adapters own browser subscriptions and scheduling; the state factory enforces one active runtime owner.

## Persistent state

`createPersistentSignal` mirrors one typed storage key into a Preact core signal. Persistence occurs before the in-memory signal changes, so a failed write cannot leave the two representations inconsistent.

## Session expiry

`createSessionExpiryChannel` creates an isolated coordination channel. It deduplicates expiry notifications, suppresses them during intentional logout, and lets applications decide how listeners affect routing or authentication.

## Failure semantics

- Invalid HTTP data raises the original Zod error without logging raw payloads.
- Malformed query filters fail before a request is sent.
- Invalid pageable metadata is rejected at the API boundary.
- Request cancellation is recognized without assuming DOM globals exist.
- Connectivity policy and concurrent runtime ownership fail synchronously.
- Persistence failures leave the signal unchanged.
- Session listeners are isolated and may report failures through injected policy.

## Verification and live documentation

Package tests cover public services, transport boundaries, connectivity lifecycle, persistence, session isolation, and the React-free contract. The unified Vireo Storybook contains executable examples under **Infrastructure**; every displayed source file is the same TypeScript module Storybook executes.
