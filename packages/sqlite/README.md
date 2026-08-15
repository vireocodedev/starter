# @vireocodedev/starter-sqlite

Reusable SQLite worker, lifecycle, offline queue, and hydration primitives for starter applications.

This package provides:

- OPFS SQLite bootstrap + migration execution
- Worker-side request dispatch runtime
- Managed client-side worker transport/runtime with reset, disposal, and in-memory fallback stores
- Generic worker config builder for injected migrations/handlers
- Instance-scoped database/entity/hydration concurrency coordination
- Database ownership, ordered offline-data cleanup, and configurable OPFS file lifecycle
- Runtime-bound entity, hydration metadata, offline queue, and SQL-console clients
- Complete offline queue persistence, capture, status, retry, and deterministic replay contracts
- Framework-neutral hydration scheduling, status, readiness, requests, and local-reflection queues

The host application remains responsible for:

- Entity bundle definitions
- Migration discovery/content
- Database filenames, storage namespaces, worker construction, and browser bindings
- Authentication, connectivity, remote revision, endpoint, retry, and diagnostics policy
- Application entity schemas, hydration contributors, and UI/signal projection

## Install

```bash
npm install @vireocodedev/starter-sqlite
```

## Public API

The root entrypoint exports the SQLite worker/runtime contracts plus the managed
runtime, transport, concurrency, lifecycle, queue, hydration, and development
client factories. Each factory is explicitly configured so independent app or
test runtimes do not share fallback stores, pending requests, locks, or status.

The `@vireocodedev/starter-sqlite/offline` entrypoint continues to expose
transport-neutral offline mutation, hydration, queue-header/policy, and network
status helpers.

Worker SQL operations bind values separately from SQL structure. Applications
remain responsible for trusted table, request, and entity definitions.
