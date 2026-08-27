# Vireo Starter Offline

`vireo-offline` provides authenticated mutation replay, idempotent command tracking, per-entity hydration revisions, and transaction-aware server-sent change batches for row-shaped applications.

## Why it exists

Offline-capable applications otherwise duplicate command persistence, retry classification, replay authorization, hydration invalidation, and SSE lifecycle behavior. Offline centralizes the server side of that protocol while applications retain ownership of domain mutations, record authorization, browser persistence, and product-specific conflict resolution.

## Installation

```groovy
dependencies {
    implementation platform("com.vireocode:vireo-bom:0.2.0")
    implementation "com.vireocode:vireo-offline"
}
```

The artifact depends on Core and Query Engine. Auth is an implementation dependency used only by the replaceable default actor adapter; the Offline schema does not require actors to exist in Auth's user table.

## Runtime contract

- `POST /api/offline/sync` replays bounded mutation batches and records idempotent outcomes.
- `POST /api/offline/sync/commands/search` exposes caller-scoped command diagnostics.
- `GET /api/offline/hydration/versions` returns normalized per-entity revisions.
- `GET /api/offline/heartbeat` and `/stream` expose current sync state and transaction-aware change batches.
- `OfflineSyncReplayHandler` is an ordered application extension point for domain replay that should not loop through the HTTP stack.
- `OfflineActorResolver` supplies application-neutral ownership and privileged-read policy.

All default endpoints require authentication. A non-privileged actor sees only commands owned by its stable ID, with username fallback for legacy rows. A privileged actor may inspect the complete command stream.

## Replay safety

The default policy accepts only `POST`, `PUT`, `PATCH`, and `DELETE` beneath `/api/`. Auth and Offline paths are excluded. Paths must be relative, canonical, fragment-free, and free of encoded traversal. Only `Content-Type`, `Idempotency-Key`, and `X-Offline-Temp-Id` are accepted from queued command headers; session cookie and XSRF headers come from the authenticated flush request.

Request bodies and headers are omitted from `OfflineSyncCommandDto.toString()`. Downstream exception bodies are not returned to clients. Duplicate IDs inside one batch and oversized batches fail before replay.

Custom handlers receive an immutable command DTO and return an outcome. Offline—not the handler—owns persistence, retry state, and timestamps.

## Configuration

```properties
vireo.starter.offline.sync-endpoint-enabled=true
vireo.starter.offline.heartbeat-endpoint-enabled=true
vireo.starter.offline.hydration-endpoint-enabled=true
vireo.starter.offline.sync-endpoint-path=/api/offline/sync
vireo.starter.offline.heartbeat-endpoint-path=/api/offline/heartbeat
vireo.starter.offline.hydration-endpoint-path=/api/offline/hydration
vireo.starter.offline.max-batch-size=100
vireo.starter.offline.max-replay-attempts=5
vireo.starter.offline.max-hydration-entities=100
vireo.starter.offline.heartbeat-interval=1s
vireo.starter.offline.replay-api-prefix=/api/
vireo.starter.offline.replay-methods=POST,PUT,PATCH,DELETE
vireo.starter.offline.excluded-replay-path-prefixes=/api/auth,/api/offline/
vireo.starter.offline.replay-headers=Content-Type,Idempotency-Key,X-Offline-Temp-Id
vireo.starter.offline.privileged-role=SUPERADMIN
```

Endpoint paths must be absolute and distinct. Numeric limits and heartbeat cadence are validated at startup. Disabling controllers does not disable replay, revision, heartbeat, migration, or Core SPI services.

## Persistence and failure semantics

`command_id` is unique. A stored `DONE` command is idempotent success; transient failures are retried up to the configured server budget; permanent 4xx failures, excluding timeout and throttling responses, are rejected. Concurrent inserts return a retryable conflict. Handler results are persisted centrally.

Entity revision bumps use row locking and bounded insert-race recovery. Change events flush only after transaction commit and are discarded on rollback. Concurrent sync batches keep the heartbeat in-progress state true until the last batch finishes.

The module owns `sync_command` and `offline_entity_version` through `flyway_schema_history_vireo_offline`. V2 removes the legacy Auth foreign key so custom actor IDs remain valid audit data.

The matching browser implementation lives in `@vireocodedev/sqlite`: it owns the persistent browser queue, replay scheduling, hydration state, and network policy. JSON is the boundary between the two runtimes.

See the unified Vireo Starter Storybook under **JVM → Offline** for the compiled handler example and operational guidance.
