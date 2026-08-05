# @vireocodedev/starter-shell

The **app-shell framework** for the vireocodedev **starter** product: config /
sitemap / routing scaffolding, route guards, the responsive shell + navigation,
and shell layout presets.

## Install

```bash
npm install @vireocodedev/starter-shell
```

Peers: `react`, `react-dom`, `react-router`, `@mui/material`,
`@mui/icons-material`, `@tanstack/react-query`. Depends on
`@vireocodedev/starter-ui`, `@vireocodedev/starter-localization` and
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
- **Shell** — `AppShellLayout` + `AppShellContext`, responsive nav (header,
  side nav, mobile bottom nav, resize), window-controls-overlay hooks, and the
  `AppBare/AppDashboard/AppPublic` shell layout presets.
- **Devtools** — `installDevConsoleFilters`.

## Versioning contract

The routing/config helper surface is pinned by the contract test; the shell
components are validated by consuming apps.
