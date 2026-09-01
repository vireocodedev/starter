# Offline behavior

Vireo separates an offline **shell**, separately published local **primitives**, and an application-owned offline **domain capability**. They are different promises. The current Template ships the shell and connectivity UX only; it does not include SQLite or `vireo-offline` dependencies, and it does not make Item or generated CRUD safe offline.

## Current capability matrix

| Capability        | What Vireo currently provides                                                                                                                                              | Explicit limit                                                                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell             | A production service worker precaches the reviewed application shell after one successful production load. It can start and show unavailable/retry states without the API. | It cannot create server data, credentials, or a first sign-in. Development mode and installed-PWA/device evidence are not the production guarantee.            |
| Connectivity      | The UI distinguishes browser-offline, checking, reachable, unavailable, and mock states.                                                                                   | `navigator.onLine` is only a hint. An HTTP response proves a request reached something; its status, identity, authorization, and body still determine success. |
| Primitives        | `@vireocodedev/sqlite` and `vireo-offline` offer local SQLite/OPFS, hydration, queue/replay, owner lifecycle, migrations, revision and server-handler contracts.           | They do not choose entities, persistence, conflict rules, or recovery UI for an application. In-memory storage is process-lifetime only.                       |
| Domain capability | An application may deliberately admit a read or command after defining its safety contract.                                                                                | No capability is generated automatically: schema v1 requires `capabilities.offline: false`.                                                                    |

The [pinned 0.7.0 Template offline guide](https://github.com/vireocodedev/vireo-template/blob/a670d7f95f720a91705c7c156d19e605582fb4c8/docs/offline.md) and its [PWA policy](https://github.com/vireocodedev/vireo-template/blob/a670d7f95f720a91705c7c156d19e605582fb4c8/frontend/pwa-policy.mjs) are the reviewable source for this release. The framework publishes the separate [offline primitive contract](https://github.com/vireocodedev/vireo/blob/b068ba6b51c4c93430b0fed167cd3427e7082277/docs/OFFLINE_GUARANTEES.md), including compile-checked [TypeScript](https://github.com/vireocodedev/vireo/blob/b068ba6b51c4c93430b0fed167cd3427e7082277/packages/sqlite/docs/examples/orderQuantityOfflineReplay.example.ts) and [JVM](https://github.com/vireocodedev/vireo/blob/b068ba6b51c4c93430b0fed167cd3427e7082277/jvm/vireo-starter-documentation-examples/src/main/java/com/vireocode/docs/offline/OfflineReplayConfigurationExample.java) examples. Adopt that separate primitive layer only when building the application-owned domain-capability row.

## Template boundaries

Every authenticated API route is `NetworkOnly`. The Template does not cache Item reads or writes, queue Item CRUD, replay arbitrary requests, or provide a generic offline merge policy. A cache-first rule around authenticated responses is a cross-user and cross-tenant data-disclosure risk unless storage identity and lifecycle are explicitly designed.

Unsupported by the default Template: offline before the first successful load or sign-in; server-backed reads and mutations; generated offline capabilities; automatic temporary-ID handling; cross-tab, cross-browser, or cross-device convergence; universal conflict resolution; browser encryption; automatic backoff/cancellation/export UX; and automatic downgrade or old-client command migration.

## Admission checklist for one domain capability

Before telling a user that a read or command works offline, document and test all of the following.

1. The eligible reads and commands, why each stale read or queued mutation is safe, and the owner/tenant key plus login, logout, switch, release, and purge lifecycle.
2. A stable command ID allocated **before the first request**, server-side idempotency, authentication and authorization, canonical payload validation, and external-side-effect idempotency.
3. Command dependencies, create/update/delete chains, temporary IDs, ordering assumptions, and the absence of a global order across tabs or devices.
4. Retry and backoff policy; retryable versus permanent failure; conflict classification; cancellation, discard, export, operator support, and recovery paths.
5. Storage sensitivity, URL/body/header handling, encryption limits, quota, unavailable/full storage, corruption, worker failure, migrations, downgrade refusal, purge, and re-hydration.
6. App/schema/version compatibility, an old client against a changed server, update while commands are pending, and cross-tab/device suspension, clock skew, out-of-order delivery, and reconciliation.
7. Accessible queue, progress, failure, conflict, and recovery UI; visible diagnostics that redact bodies and headers; plus the adversarial test matrix for offline before/after login, refresh, interrupted submission/hydration, logout/session expiry, and externally cleared storage.

The primitives acknowledge a command only after durable enqueue succeeds, bind a command ID to an authenticated actor and canonical request fingerprint, preserve failed commands rather than silently discarding them, and serialize owner transitions inside one managed runtime. They deliberately do not supply your tenant identity, conflict policy, global lock, or support workflow.

## Connectivity, updates, and recovery

Treat connectivity as a signal, never a success claim. Browser online status may be true while DNS, TLS, captive portals, the backend, a session, or authorization is unavailable. Handle request failures explicitly, retain actionable error context, and make retry intentional.

The Template checks for updates periodically (including an hourly discovery cycle), surfaces availability deliberately, and must let an application guard unsaved changes before a user accepts an update. Do not force activation or reload behind a user’s work. A newly installed worker normally becomes active only after the old worker no longer controls open pages.

For a stale shell, first close application tabs, reload once online, and inspect the active worker and update prompt. If recovery requires unregistering the worker or clearing site data, explain the consequence and obtain confirmation: **clearing site data removes application-owned offline state**, including any local queue or hydrated data. An application that adopts primitives must provide a lawful export, support-safe inspection, and a confirmed purge/re-hydration path rather than silently deleting data.

## Deliberate adoption sequence

1. Start with the shell and read-only unavailable states; do not imply cached domain data.
2. Choose one narrow, low-risk command and implement the paired client/server contract.
3. Define storage ownership, migration, authorization, idempotency, conflict, retry, and recovery behavior from the checklist.
4. Test the adversarial states with real durable storage and accessible user feedback.
5. Add redacted observability and support procedures before admitting another command.

The [live demo](https://demo.vireocode.com) demonstrates the bounded shell, not a blanket offline synchronization promise.
