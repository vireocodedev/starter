# @vireocodedev/starter-core

## 0.8.0

### Minor Changes

- f410b87: Absorb `@rgo/front-ui` into `starter-ui`.

  The whole `@rgo/front-ui` source tree now lives in this package: the `Rgo*`
  inputs, tables, layout, feedback and data-display components, the `useRgo*`
  hooks, the providers (`RgoProviders`, theme/localization/query-client/snackbar/
  confirm/icons), the `RgoLocalStorageService` / `RgoOfflineCacheService` /
  `RgoWebWorkerService` services, the `axios` / `@tanstack/react-query` /
  `i18next` / `@hello-pangea/dnd` feature adapters, and the `utils`
  modules. Every former `@rgo/front-ui` export is re-exported from the
  `@vireocodedev/starter-ui` barrel under the same name, and the unbundled `dist`
  keeps the same subpath layout — `@rgo/front-ui/utils/apiutils` becomes
  `@vireocodedev/starter-ui/utils/apiutils`.

  **Breaking:** the package now requires the peers front-ui used to own —
  `@emotion/react`, `@emotion/styled`, `@tanstack/react-query`, `axios`,
  `i18next`, `react-i18next` and `zod` — and drops the `@rgo/front-ui` peer.
  Consumers no longer need the `@rgo` registry routed in `.npmrc`.

  Storybook moves across with the source: 70 stories and the documentation MDX
  now build from this package (`npm run storybook`).

  One latent type error surfaced in the move: `RgoTablePagination` passed
  i18next's reserved `count` interpolation as a string. It is now passed as the
  number i18next expects; the rendered output is unchanged. front-ui never caught
  this because its `typecheck` script resolved to a project with no input files.

  `starter-core` follows: it imports `RgoIcon` and augments the icon registry
  through `@vireocodedev/starter-ui` instead, and drops `@rgo/front-ui` entirely.

### Patch Changes

- Updated dependencies [f410b87]
  - @vireocodedev/starter-ui@2.0.0

## 0.7.0

### Minor Changes

- 4ada297: Invert the core/ui dependency so ui sits below core.

  `AppBottomDrawer` and the `APP_PAGE_CONTENT_*` width constants move from
  `starter-core` to `starter-ui`. They were the only things ui needed from core,
  and keeping them in core forced ui to depend upwards on the app shell.

  `starter-core` now depends on `starter-ui` instead of the reverse, and builds
  after it. Core re-exports both moved modules from its barrel, so existing
  `@vireocodedev/starter-core` import paths keep working — but new code should
  import them from `@vireocodedev/starter-ui` directly.

  This is groundwork for absorbing `@rgo/front-ui` into `starter-ui`: core imports
  front-ui components today, so with the old edge direction that merge would have
  produced a `core → ui → core` cycle.

### Patch Changes

- Updated dependencies [4ada297]
- Updated dependencies [ff3ada7]
  - @vireocodedev/starter-ui@1.1.0

## 0.6.3

### Patch Changes

- Updated dependencies [5315b5c]
  - @vireocodedev/starter-localization@0.7.0

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
