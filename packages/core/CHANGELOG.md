# @vireocodedev/starter-core

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
