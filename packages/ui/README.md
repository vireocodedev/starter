# @vireocodedev/starter-ui

The **MUI-based UI component library** for the vireocodedev **starter** product:
responsive cards, mobile/infinite server tables, overlays, app providers,
layout hooks, and formatters.

> This package takes `@mui/*` and `@rgo/front-ui` as **peer dependencies** — it
> is tied to the starter design system, not a generic component kit.

## Install

Published to **GitHub Packages** under the `@vireocodedev` scope. Because it
peers on `@rgo/front-ui` (a private registry), consumers need both scopes routed
in `.npmrc`:

```
@vireocodedev:registry=https://npm.pkg.github.com
@rgo:registry=https://git.rgo.hr/api/packages/RGO/npm/
```

```bash
npm install @vireocodedev/starter-ui
```

Peers: `react`, `react-dom`, `@mui/material`, `@mui/icons-material`,
`@mui/x-date-pickers`, `@rgo/front-ui`, `react-hook-form`, `sonner`, `dayjs`.
Depends on `@vireocodedev/starter-localization`, which owns the `platform` and
`history` translation namespaces this package renders.

## What's included

- **Components** — `ResponsiveCard`, `AppCard*`, `SlidingScreenStack`,
  `MobileFormParts`, `ResponsiveMonthYearPicker`, `FormToggleButtonField`,
  `ManagementSearchToolbar`, `AppBottomDrawer`, `DelayedRender`.
- **Tables** — the management/server table system: `ManagementServerTable`,
  `RgoServerTableMobile`, `MobileTable*`, `TableActionCell`, skeletons, plus the
  infinite-scroll/table utils and `useMobileTableExpansion`.
- **Providers** — `AppConfirmProvider`, `AppSnackbarProvider`,
  `AppMobileAttributeProvider`, `AppThemeColorMetaProvider`.
- **Hooks** — `useResponsiveProps`, `useAppPageContentLayout`,
  `usePageOverlayModes`, `useDelayedOverlayMount`, `useSingleFlightAction`,
  `useManagementTableState`, `useMediaQueryDevice`.
- **Layout** — `AppPageContentLayoutContext`, layout utils + shell breakpoints.
- **Utils** — currency/date formatters, `downloadFile`.

## Notes

- Everything is a **named export** off the package root.
- The app retains the composition roots that wire these into app-specific shells
  (e.g. the history overlay, the app overlay frame).

## Versioning contract

The exported surface is a contract (add = minor, remove/rename = major).
