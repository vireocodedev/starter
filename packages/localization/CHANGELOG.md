# @vireocodedev/starter-localization

## 0.4.0

### Minor Changes

- 10c930e: Move the offline/network vocabulary and the app-shell accessibility labels into the `platform` namespace, and resolve them inside `starter-core` via `usePlatformTranslation`.

  `starter-core`'s shell previously called `t("common.skipToMainContent")`, `t("common.mainNavigation")`, `t("common.closeNavigation")`, `t("common.collapse")`, `t("common.expand")`, `t("common.bottomNavigation")` and `t("common.loading")` through the app-injected `runtime.i18n.t`. Those keys were declared nowhere, so a consumer that did not happen to define them rendered raw key strings in its navigation landmarks and mobile bottom navigation. They now ship with `platform` and are resolved by the package itself.

  `platform.network` additionally gained the full offline-queue and sync-command vocabulary (status, queue state, and the `OfflineSyncCommandRecord` column labels), so consumers no longer need to author it.

  App-supplied nav entry labels, breadcrumbs and control labels still resolve through `runtime.i18n.t` — that contract is unchanged.

## 0.3.0

### Minor Changes

- 9f71a98: Own every shared `@vireocodedev` translation namespace.

  The `queryengine` and `history` namespaces moved here from
  `@vireocodedev/starter-queryengine` and `@vireocodedev/starter-ui`, so a single
  package now ships all common strings and app consumers no longer restate them.

  Added:

  - `createStarterResources({ locales, seedFrom?, overrides? })` — builds every
    starter namespace for every requested locale in one call, with per-namespace
    deep-merged overrides.
  - `registerStarterResources(i18n, config)` — imperative equivalent.
  - `createQueryEngineResources`, `createHistoryResources`,
    `useQueryEngineTranslation`, `useHistoryTranslation`,
    `queryEngineBaseResources`, `historyBaseResources`,
    `QUERYENGINE_TRANSLATION_NAMESPACE`, `HISTORY_TRANSLATION_NAMESPACE`, and the
    `QueryEngineResources` / `HistoryResources` type families.
  - `STARTER_TRANSLATION_NAMESPACES`, `STARTER_BASE_LOCALES`.

  No translation key changed, so `t()` call sites are unaffected.
  `registerPlatformResources` is deprecated in favour of
  `registerStarterResources`.

## 0.2.0

### Minor Changes

- cb28b02: Initial release of the starter localization foundation: `platform` namespace
  resources (`common`, `network`, `pwa`), the `usePlatformTranslation` hook, and the
  i18n toolkit (`createPlatformResources`, `createNamespaceResources`, `deepMerge`,
  types) with per-locale overrides and seed-from-base new-language support.
