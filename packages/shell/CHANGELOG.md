# @vireocodedev/starter-core

## 2.1.0

### Minor Changes

- 1e60285: starter shell fix

## 2.0.0

### Major Changes

- dc5b42d: Milestone - collective major bump

### Patch Changes

- Updated dependencies [dc5b42d]
  - @vireocodedev/starter-infrastructure@1.0.0
  - @vireocodedev/starter-localization@1.0.0
  - @vireocodedev/starter-ui@4.0.0

## 1.1.0

### Minor Changes

- cd33fb5: `shell.mobileBottomNavigation` is now optional.

  The bottom bar only exists in `dashboard` mode, but the config demanded
  `authenticatedItems`, `loginItem` and `moreItem` from every app regardless. A
  `bare` or `public` app had to invent three items it would never render just to
  satisfy the type.

  The key may now be omitted. `AppMobileBottomNavigation` renders nothing when it
  is absent, and `validateAppConfig` only checks the block when it is present.

  Additive — apps that declare it are unaffected.

  Closes gap F6 (roadmap 2.4, work item W7).

- cd33fb5: Permissions can now be evaluated against a scope.

  A permission alone answers "may this role ever do X". Both second-domain apps
  needed the narrower question "may this user do X _here_" and neither could
  express it: LMS scopes by the shift a user is on duty for, FRED by the tenant
  that owns the record (`companyId`, enforced server-side by `CompanyIdValidator`).

  `runtime.permissions.canAccess` now takes an optional second argument:

  ```ts
  canAccess: (permission: string | undefined, scope?: AppPermissionScope) => boolean;
  ```

  `AppPermissionScope` is an opaque `Record<string, unknown>` — the starter does
  not know what an app's scoping dimensions are, so the app's own `canAccess`
  implementation interprets it.

  A static `permissionScope` can be declared anywhere a `permission` already can:
  nav entries (`appNav.item`, `disabledItem`, `control`, `slot`), page and section
  definitions, mobile bottom nav items, nav control configs, and route handles. The
  nav visibility filter, the mobile bottom navigation, the public shell layout and
  `AppRouteGuardLayout` all pass it through.

  Scopes that vary per record can only be known at the call site, so two hooks are
  exported for that: `useAppPermissions()` returns the checker, and `useAppCan()`
  resolves one permission:

  ```tsx
  <RgoShowIf when={useAppCan("lockage:finalize", { shiftId })}>
    <FinalizeButton />
  </RgoShowIf>
  ```

  Fully additive. An existing `(permission) => boolean` implementation stays
  assignable and every existing call site keeps working.

  Closes gaps G11 and F17 — the highest-ranked structural theme from both paper
  prototypes (roadmap 2.4, work item W1).

- cd33fb5: Shell mode is now resolved per route, and actually drives the layout.

  `config.shell.mode` was declared, validated, and then read by nothing — the app
  had to import a layout preset and wire it into the route tree by hand, which
  made the config field decorative and the choice permanent for the whole app.

  `AppShellModeLayout` closes the loop. It picks the preset that matches the
  resolved mode:

  ```tsx
  <AppShellModeLayout config={APP_CONFIG} runtime={runtime} />
  ```

  `config.shell.mode` remains the app-wide default. Any route may override it via
  `handle.shellMode`, and the deepest matched override wins:

  ```ts
  {
    path: "map",
    element: <MapPage />,
    handle: { shellMode: "bare" },
  }
  ```

  That is what both paper prototypes needed and neither could express: FRED's map
  is full-bleed while its admin pages are not, and LMS varies its chrome by role.

  `useAppShellMode(config)` is exported for apps that need the resolved mode
  without the layout.

  Additive — the presets are still exported and still work when imported directly.

  Closes gaps G7 and F3, and resolves G8 (roadmap 2.4, work item W2).

### Patch Changes

- Updated dependencies [cd33fb5]
- Updated dependencies [cd33fb5]
- Updated dependencies [cd33fb5]
  - @vireocodedev/starter-localization@0.10.0
  - @vireocodedev/starter-ui@3.2.0

## 1.0.0

### Major Changes

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

- a194df9: Remove duplicated exports so each symbol has exactly one home.

  **Breaking changes**

  - `@vireocodedev/starter-shell` no longer re-exports `AppBottomDrawer`, `AppBottomDrawerProps` or the `APP_PAGE_CONTENT_*` width constants. Import them from `@vireocodedev/starter-ui`, where they are defined.
  - `@vireocodedev/starter-ui` no longer exports `AppConfirmProvider`. It was a pass-through wrapper that rendered `RgoConfirmProvider` and added nothing — use `RgoConfirmProvider` directly.

### Patch Changes

- Updated dependencies [6394ad9]
- Updated dependencies [3feef19]
- Updated dependencies [a194df9]
- Updated dependencies [04d26a3]
- Updated dependencies [829c409]
- Updated dependencies [2b53a55]
- Updated dependencies [829c409]
- Updated dependencies [829c409]
- Updated dependencies [c49616c]
  - @vireocodedev/starter-ui@3.0.0
  - @vireocodedev/starter-localization@0.9.0

## 0.9.0

### Minor Changes

- ada88d7: Remove tseep dependency, add turbo for build

### Patch Changes

- Updated dependencies [ada88d7]
  - @vireocodedev/starter-infrastructure@0.4.0
  - @vireocodedev/starter-localization@0.8.0
  - @vireocodedev/starter-ui@2.1.0

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
