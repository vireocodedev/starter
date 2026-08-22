# @vireocodedev/starter-shell

The **app-shell framework** for the vireocodedev **starter** product: config /
sitemap / routing scaffolding, route guards, the responsive shell + navigation,
and shell layout presets.

## Install

```bash
npm install @vireocodedev/starter-shell
```

Peers: `react`, `react-dom`, `react-router`, `@mui/material`,
`@mui/icons-material`, `@preact/signals-react`, `@tanstack/react-query`,
`i18next`, and `react-i18next`. Depends on `@vireocodedev/starter-ui` and
`@vireocodedev/starter-infrastructure`.

## Consumer requirements

- **`vite-plugin-pwa`** — `AppPwaUpdateBanner` imports the plugin's
  `virtual:pwa-register/react` module (externalized here; your build resolves it).
- **Theme + icons contract** — the shell reads numeric MUI palette shades
  (e.g. `palette.primary[600]`) and a `"dots-vertical"` overflow icon; provide
  these via your MUI theme + the `@vireocodedev/starter-ui` icon registry (the
  starter does).

## What's included

- **Config / sitemap** — typed config contracts (`AppPageConfig`, `AppBrand`,
  route/nav types), `definePages`/`defineRoutes`/`defineSections`, `appNav`,
  `routePath` helpers, route metadata.
- **Route guards** — `AppRouteGuardLayout`, `AppRouteGuardLogin`, `authRedirect`.
- **Navigation** — configurable route View Transitions and nested-page
  forward/back navigation with parent state restoration.
- **Overlay history** — `OverlayHistoryBridge` and `useOverlayBackClose`, backed
  by a package-internal stack state machine/store that dismisses nested overlay
  layers before routes.
- **Unsaved changes** — the React Router adapter that composes Starter UI's
  scoped registry with route blocking, unload protection, bypass policy, and an
  injected prompt renderer.
- **Shell** — `AppShellLayout` + `AppShellContext`, responsive nav (header,
  side nav, mobile bottom nav, resize), window-controls-overlay hooks, and the
  `AppBare/AppDashboard/AppPublic` shell layout presets.
- **Devtools** — `installDevConsoleFilters`.

## Versioning contract

The routing/config helper surface is pinned by the contract test; the shell
components are validated by consuming apps.
