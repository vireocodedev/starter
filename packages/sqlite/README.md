# @vireocodedev/starter-sqlite

Framework-free SQLite, OPFS, offline queue, and hydration primitives for browser applications.

The package owns reusable storage mechanics. An application still owns its schema, migrations, database filename, Worker entry module, API transport, connectivity policy, and product-specific recovery UX.

## Install

```bash
npm install @vireocodedev/starter-sqlite @sqlite.org/sqlite-wasm
```

The package name is stable; registry selection and authentication belong to the
consumer's approved release-channel configuration and are intentionally not
embedded here. TypeScript declarations are verified from the packed artifact
with TypeScript 6, `moduleResolution: "Bundler"`, and `skipLibCheck: false`.
Relative source maps with embedded source content are published intentionally
for debugging.

## Entry points

| Entry point                            | Responsibility                                                                                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `@vireocodedev/starter-sqlite`         | Worker runtime, entity bundles and clients, lifecycle, hydration, persistent offline queue, replay, and SQL-console contracts |
| `@vireocodedev/starter-sqlite/offline` | Transport-neutral offline mutation, paged hydration, request-header, queue-policy, and network-status helpers                 |

Both entry points are React-free and worker-safe. They do not own UI, signals, query caches, application entities, or HTTP clients.

## Runtime architecture

```text
application client
  -> createManagedSqliteRuntime
  -> createSqliteTransport
  -> typed entity / queue / hydration clients
  -> module Worker
  -> createSqliteWorkerRuntime(createSqliteWorkerRuntimeConfig(...))
  -> OPFS SQLite database + ordered migrations
```

`createManagedSqliteRuntime` single-flights initialization, correlates requests, owns fallback stores, and provides deterministic `reset()` and `dispose()` behavior. A Worker crash rejects current work and tears down that Worker; the next request creates and initializes a fresh instance.

The application must create a module Worker and install the worker runtime itself. Database filenames and migration arrays are explicit inputs so independent applications and tests never share hidden global state.

## Entity bundles

`createSqliteEntityBundle` derives four typed worker operations from one entity specification: replace the snapshot, upsert one row, list rows, and delete by identifier. Exactly one field must declare `id: true`.

Entity, table, field-column, request-key, and generated-column configuration is validated before SQL is generated. `createSqliteWorkerRuntimeConfig` rejects duplicate operation names instead of silently replacing one handler with another.

Table names, column names, ordering expressions, migrations, and extra worker handlers remain trusted application-authored SQL structure. Runtime data values are bound separately.

## Offline queue

The root entry point exposes one complete persistent queue contract:

- ordered command capture;
- pending and permanently-failed states;
- retry counts and last errors;
- deterministic batch replay;
- successful-command cleanup;
- explicit status projection;
- equivalent instance-scoped in-memory fallback behavior.

Persisted command bodies and headers are parsed strictly. Corrupt JSON raises a descriptive error carrying the command identifier rather than replaying altered fallback data. Batch sizes and retry limits must be positive integers.

The package does not decide when the browser is offline, which requests are safe for a product to queue, how authentication is refreshed, or how permanent failures are shown to a user.

## Hydration

Hydration is split into small contracts:

- contributor registration;
- request batching and targeted retries;
- local revision metadata;
- readiness/status projection;
- exclusive database/entity execution;
- paged snapshot collection through the `/offline` entry point.

The hydration controller compares local and remote revisions, applies per-entity timeouts, records failures, and schedules bounded retries. The host supplies contributors, revision transport, locks, event projection, and clock/scheduler dependencies.

## Lifecycle and ownership

Database ownership, OPFS file discovery/removal, offline-data cleanup ordering, and operation coordination are instance-scoped factories. Construct one set per application runtime and dispose it when that runtime ends.

Destructive lifecycle operations are deliberately explicit. The host chooses storage namespaces, confirmation policy, and when clearing local data is safe.

## Failure semantics

- Invalid entity or worker configuration throws synchronously.
- Duplicate worker operation names throw synchronously.
- Worker failure rejects pending requests and permits recovery on a new Worker.
- Reset rejects pending work, terminates the active Worker, and clears initialization state.
- Dispose is idempotent and permanently rejects later work.
- Migration failure rolls the transaction back.
- A database schema newer than the available migration list is rejected.
- Corrupt persisted queue JSON is rejected, never defaulted.

## Verification and live documentation

Package tests exercise runtime lifecycle, queue persistence/replay, hydration scheduling, lifecycle cleanup, concurrency, and framework boundaries. The unified Vireo Storybook contains executable examples under the top-level **SQLite** section; every displayed source file is the same TypeScript module Storybook executes.
