# @vireocodedev/starter-ui

The **MUI-based UI component library** for the vireocodedev **starter** product:
the `Rgo*` design-system primitives (inputs, tables, layout, providers, hooks,
services), plus responsive cards, mobile/infinite server tables, overlays, app
providers, layout hooks, and formatters.

> This package takes `@mui/*` as **peer dependencies** — it is tied to the
> starter design system, not a generic component kit.

## Install

Published to **GitHub Packages** under the `@vireocodedev` scope:

```
@vireocodedev:registry=https://npm.pkg.github.com
```

```bash
npm install @vireocodedev/starter-ui
```

Peers: `react`, `react-dom`, `@mui/material`, `@mui/icons-material`,
`@mui/x-date-pickers`, `@emotion/react`, `@emotion/styled`,
`@tanstack/react-query`, `axios`, `i18next`, `react-i18next`, `react-hook-form`,
`zod`, `sonner`, `dayjs`. Depends on `@vireocodedev/starter-localization`, which
owns the `platform` and `history` translation namespaces this package renders.

The package ships unbundled: `dist` mirrors `src` file-for-file, so subpaths can
be imported directly (`@vireocodedev/starter-ui/utils/apiutils`) when pulling the
whole barrel — and its MUI graph — is not acceptable.

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
