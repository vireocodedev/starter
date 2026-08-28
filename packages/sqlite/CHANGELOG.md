# @vireocodedev/sqlite

## 0.2.2

### Patch Changes

- fe25cd3: Reject duplicate queued command IDs and malformed replay responses, make equal-time
  ordering deterministic, and serialize different concurrent offline-owner changes.

## 0.2.1

### Patch Changes

- f3ea1c2: Include the compiled distribution artifacts required by public npm consumers.

## 0.2.0

### Initial public release

- Publish the worker-safe SQLite runtime, migrations, OPFS ownership, offline
  queue and replay, hydration, serialization, console, and utility contracts at
  the canonical coordinate.
- Establish the public `0.x` compatibility line on npm.
