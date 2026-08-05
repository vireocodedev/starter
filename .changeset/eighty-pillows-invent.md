---
"@vireocodedev/starter-shell": major
"@vireocodedev/starter-sqlite": minor
---

Rename `@vireocodedev/starter-core` to `@vireocodedev/starter-shell`, and move
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
