# @vireocodedev/starter-queryengine

## 1.1.1

### Patch Changes

- a194df9: Widen the `zod` peer range floor to `>=3.24` to match `@vireocodedev/starter-ui`.

  Both packages previously advertised `>=3`, so a consumer could install a zod version
  that satisfied them but not `starter-ui`, which `starter-ui` depends on `starter-history`
  for. The ranges now agree on a single floor.

## 1.1.0

### Minor Changes

- ada88d7: Remove tseep dependency, add turbo for build

## 1.0.0

### Major Changes

- 9f71a98: **Breaking:** the `queryengine` translation namespace moved to
  `@vireocodedev/starter-localization`.

  `useQueryEngineTranslation`, `createQueryEngineResources`,
  `queryEngineBaseResources`, `QUERYENGINE_TRANSLATION_NAMESPACE` and the
  `QueryEngineResources` types are no longer exported from this package — import
  them from `@vireocodedev/starter-localization` instead. Translation keys are
  unchanged, so only import specifiers need updating.

  `i18next` and `react-i18next` are no longer peer dependencies, and the package
  no longer depends on `@vireocodedev/starter-localization`.

## 0.2.0

### Minor Changes

- 35ac46f: Initial release of the framework-agnostic query engine client: typed models and
  zod schemas, an injectable HTTP-port API (`createQueryEngineApi`), a react-query
  layer (`createQueryEngineQueries`), shared signals, and a `queryengine` i18n
  namespace built on `@vireocodedev/starter-localization`.
