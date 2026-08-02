# @vireocodedev/starter-core

## 0.6.2

### Patch Changes

- Updated dependencies [957e1c8]
  - @vireocodedev/starter-localization@0.6.0

## 0.6.1

### Patch Changes

- Updated dependencies [dfe6b35]
  - @vireocodedev/starter-localization@0.5.0

## 0.6.0

### Minor Changes

- 10c930e: Move the offline/network vocabulary and the app-shell accessibility labels into the `platform` namespace, and resolve them inside `starter-core` via `usePlatformTranslation`.

  `starter-core`'s shell previously called `t("common.skipToMainContent")`, `t("common.mainNavigation")`, `t("common.closeNavigation")`, `t("common.collapse")`, `t("common.expand")`, `t("common.bottomNavigation")` and `t("common.loading")` through the app-injected `runtime.i18n.t`. Those keys were declared nowhere, so a consumer that did not happen to define them rendered raw key strings in its navigation landmarks and mobile bottom navigation. They now ship with `platform` and are resolved by the package itself.

  `platform.network` additionally gained the full offline-queue and sync-command vocabulary (status, queue state, and the `OfflineSyncCommandRecord` column labels), so consumers no longer need to author it.

  App-supplied nav entry labels, breadcrumbs and control labels still resolve through `runtime.i18n.t` — that contract is unchanged.

### Patch Changes

- Updated dependencies [10c930e]
  - @vireocodedev/starter-localization@0.4.0

## 0.5.1

### Patch Changes

- Updated dependencies [9f71a98]
  - @vireocodedev/starter-localization@0.3.0

## 0.5.0

### Minor Changes

- cc8ae97: Add accessible landmark semantics to the app shell and its layout presets:

  - The dashboard, public, and bare shell presets now render their routed
    content inside a `<main id="main-content" tabIndex={-1}>` landmark.
  - A new `AppSkipToContentLink` renders at the top of every shell preset,
    labelled via `common.skipToMainContent`, and moves focus to `#main-content`
    on activation instead of relying on native hash-navigation focus behavior.
  - `AppLayoutHeader`'s root now renders as a real `<header>` element, and its
    route breadcrumb is now the page's single `<h1>` (was a plain `<span>`) —
    visual styling is unchanged.
  - `AppLayoutNav` (desktop sidebar + mobile drawer nav) and
    `AppMobileBottomNavigation` now render as `<nav>` landmarks with an
    `aria-label` (`common.mainNavigation` / `common.bottomNavigation`).
  - `AppPublicShellLayout`'s existing `<nav>` now has an `aria-label`
    (`common.mainNavigation`) and its `<main>` gained `id="main-content"` +
    `tabIndex={-1}`.

  Consuming apps must add the `common.mainNavigation`, `common.bottomNavigation`,
  and `common.skipToMainContent` translation keys.

## 0.2.0

### Minor Changes

- 4ecc2fe: Initial release of the app-shell framework: config/sitemap/routing scaffolding
  (`definePages`, `defineRoutes`, `appNav`, `routePath` helpers, typed config
  contracts), route guards, the responsive shell + navigation (header, side nav,
  mobile bottom nav, window-controls-overlay), and the bare/dashboard/public shell
  layout presets. Peers include react-router and MUI; `AppPwaUpdateBanner`
  requires `vite-plugin-pwa` in the consuming build.
