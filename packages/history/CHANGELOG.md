# @vireocodedev/starter-history

## 0.2.0

### Minor Changes

- 62adb53: Initial release of the framework-agnostic entity history primitives: a headless
  diff/build engine (`createHistoryDefinitionBuilderFn`, `createHistoryNodes`,
  `createHistoryGroup` + engine types) and generic history models with entity-kind
  parameterization (`createHistorySchemas`, `History`, `HistorySnapshot`). Peers
  are only `zod` and `react` (type-only) — no UI, HTTP, or app coupling.
