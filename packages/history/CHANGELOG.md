# @vireocodedev/starter-history

## 3.0.0

### Major Changes

- 1c5ba14: Require Zod 4.4 or newer and migrate the public schema contracts to Zod 4's type model.

## 2.0.0

### Major Changes

- 72aac63: Replace the legacy history package with a framework-free, Zod-driven definition and diff engine featuring exhaustive typed field configuration, canonical comparison, lossless typed paths, nested objects and collections, ordered moves, validated records, deterministic failure semantics, and executable documentation.

  React presentation now belongs to Starter UI's `VireoHistoryEntry` contract.

## 1.0.0

### Major Changes

- dc5b42d: Milestone - collective major bump

## 0.4.1

### Patch Changes

- a194df9: Widen the `zod` peer range floor to `>=3.24` to match `@vireocodedev/starter-ui`.

  Both packages previously advertised `>=3`, so a consumer could install a zod version
  that satisfied them but not `starter-ui`, which `starter-ui` depends on `starter-history`
  for. The ranges now agree on a single floor.

## 0.4.0

### Minor Changes

- ada88d7: Remove tseep dependency, add turbo for build

## 0.3.0

### Minor Changes

- b090ec4: Initial release of the framework-agnostic entity history primitives: a headless
  diff/build engine (`createHistoryDefinitionBuilderFn`, `createHistoryNodes`,
  `createHistoryGroup` + engine types) and generic history models with entity-kind
  parameterization (`createHistorySchemas`, `History`, `HistorySnapshot`). Peers
  are only `zod` and `react` (type-only) — no UI, HTTP, or app coupling.

## 0.2.0

### Minor Changes

- 62adb53: Initial release of the framework-agnostic entity history primitives: a headless
  diff/build engine (`createHistoryDefinitionBuilderFn`, `createHistoryNodes`,
  `createHistoryGroup` + engine types) and generic history models with entity-kind
  parameterization (`createHistorySchemas`, `History`, `HistorySnapshot`). Peers
  are only `zod` and `react` (type-only) — no UI, HTTP, or app coupling.
