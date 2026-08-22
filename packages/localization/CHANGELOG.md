# @vireocodedev/starter-localization

## 2.0.0

### Major Changes

- 72aac63: Rebuild Localization as the framework-free owner of Starter's platform, query-engine, and history i18next resources, with typed namespace factories, late registration, isolated deep overrides, locale-neutral number formatting, explicit failure semantics, and executable documentation.

  Remove React hooks, providers, locale detection and persistence policy; React i18next adapters now live in Starter UI.

## 1.1.0

### Minor Changes

- 56eaa3b: Add locale-neutral number formatting with caller-owned options and fallback policy.

## 1.0.0

### Major Changes

- dc5b42d: Milestone - collective major bump

## 0.10.0

### Minor Changes

- cd33fb5: Localise `RgoVideoStreamPlayer` error state.

  The stream error title, message and retry button were hardcoded English strings
  in a published component. They now go through `usePlatformTranslation` like every
  other component in the package, with a new `video` section added to the platform
  namespace in both `en` and `hr`.

  Closes gap F13 from the FRED paper prototype (roadmap 2.4, work item W6).

## 0.9.0

### Minor Changes

- 829c409: Add `network.connectingToLiveUpdates` and `network.hydratingInBackground` to the platform namespace so consumers can localize offline hydration and live-update banners.

## 0.8.0

### Minor Changes

- ada88d7: Remove tseep dependency, add turbo for build

## 0.7.0

### Minor Changes

- 5315b5c: Promote the last of the generic UI vocabulary into the platform and history namespaces.

  - `platform.common` gains 16 generic strings every app was retyping: `actions`,
    `back`, `dark`, `delete`, `discard`, `download`, `edit`, `language`, `light`,
    `logout`, `month`, `name`, `profile`, `settings`, `theme`, `year`.
  - `history` gains `viewHistory`, the label for the action that opens a record's
    history — it belongs with the rest of the history vocabulary rather than in
    `platform`.

  Strings that read as generic but are not stay with the app: locale names, and
  anything naming a domain concept or an app-specific label (for example an
  `Overview` home label).

## 0.6.0

### Minor Changes

- 957e1c8: Promote the auth and shell-settings vocabulary into the platform namespace.

  - `auth` (12 keys) — sign-in form, session expiry, and the confirm dialog shown
    when signing out would discard unsynced offline changes. That last group pairs
    with the offline queue the platform already owns via `network`.
  - `settings` (10 keys) — the shell preferences an app exposes in its settings
    screen: `lockNavigationBar` (the shell's `navLocked`), the `pageBodyMaxWidth`
    label plus one per `AppShellPageBodyMaxWidth` variant, `noMaxWidth`, and the
    screen title and save confirmation.

  Only the shell-owned settings move. Preferences with no starter equivalent —
  side-panel resize and desktop surface display — stay with the app.

  Shared vocabulary only: no starter package resolves these itself, so apps keep
  rendering them through their own translation hook via the `platformBaseResources`
  spread.

## 0.5.0

### Minor Changes

- dfe6b35: Promote the routing, unsaved-changes and required-field vocabulary into the platform namespace.

  Adds three groups that every app was otherwise retyping verbatim:

  - `routing` (11 keys) — route error boundary, not-found and unauthorized copy.
  - `unsavedChanges` (6 keys) — the navigation-blocking confirm dialog, including
    its saving-in-progress variant.
  - `validation.thisFieldIsRequired` — the single string every zod schema in an
    app reaches for.

  These are shared vocabulary only; no starter package resolves them itself, so
  apps keep rendering them through their own translation hook via the
  `platformBaseResources` spread.

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
