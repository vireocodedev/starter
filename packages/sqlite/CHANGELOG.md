# @vireocodedev/starter-sqlite

## 2.1.0

### Minor Changes

- dfb0331: Add managed SQLite runtime, lifecycle, offline queue, hydration, and concurrency primitives.

## 2.0.0

### Major Changes

- dc5b42d: Milestone - collective major bump

## 1.0.0

### Major Changes

- a194df9: `@sqlite.org/sqlite-wasm` is now a peer dependency instead of a direct dependency.

  The WASM runtime keeps state in OPFS and must be configured by the host app (Vite
  `optimizeDeps.exclude`, plus the COOP/COEP headers the OPFS VFS requires). Shipping
  it as a direct dependency allowed a second, differently-versioned copy to be
  installed alongside the app's own, which would open two independent handles to the
  same database file.

  Consumers must declare `@sqlite.org/sqlite-wasm` themselves. npm installs missing
  peers automatically; pnpm and `--strict-peer-deps` users will need to add it
  explicitly.

### Minor Changes

- e82b9e6: Rename `@vireocodedev/starter-core` to `@vireocodedev/starter-shell`, and move
  its `./offline` entry point into `@vireocodedev/starter-sqlite/offline`.

  **Why**

  The package never was a core. Nothing depends on it, and it depends on
  `starter-ui`, `starter-localization` and `starter-infrastructure` — it sits at
  the top of the graph, not the bottom. Its entire root barrel is app-shell:
  config, sitemap, route guards, the responsive shell and the layout presets. A
  name that claims to be the foundation while shipping a shell makes the layering
  impossible to reason about from the outside.

  The `offline/` area was the one genuinely foundational thing inside it: twenty
  exports, zero runtime dependencies, and no relationship to a shell. It belongs
  with `starter-sqlite`, which already owns `offlineSyncCommandSqlite` and
  `hydrationEntityStateSqlite` and is likewise dependency-free and worker-safe.

  **Breaking changes**

  - `@vireocodedev/starter-core` no longer exists. Replace every specifier with
    `@vireocodedev/starter-shell`. No symbol was renamed, removed or changed.
  - `@vireocodedev/starter-core/offline` is now
    `@vireocodedev/starter-sqlite/offline`. Again, no symbol changed.

  **For `starter-sqlite` consumers**

  `./offline` is a new, additive entry point. The root entry is untouched. Both are
  covered by the worker-safety guarantee in `scripts/public-surface.mjs`, so
  neither may acquire a React, MUI or DOM dependency without failing CI.

## 0.5.0

### Minor Changes

- ada88d7: Remove tseep dependency, add turbo for build

## 0.1.0

- Initial Wave 1 runtime extraction.
