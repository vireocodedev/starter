---
"@vireocodedev/starter-ui": major
---

Remove `RgoOfflineCacheService` and the `idb` dependency.

The service was an IndexedDB-backed offline cache. Offline persistence in the starter
is now owned by `@vireocodedev/starter-sqlite` (SQLite over OPFS), so the two told
contradictory stories about where offline data lives, and the IndexedDB path had no
consumers.

Removed along with it:

- the `idb` runtime dependency
- the IndexedDB-only helper types `IndexedDBEntity`, `EntityMap`, `ObjectStore` and
  `ObjectStoreIndex` from `utils/typeutils`
- the `RgoWebWorkerService` documentation section, which documented a service that
  was never implemented

Use `@vireocodedev/starter-sqlite` for offline persistence.
