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
`@tanstack/react-query`, `@tanstack/react-virtual`, `axios`, `i18next`,
`react-i18next`, `react-hook-form`, `zod`, `sonner`, `dayjs`. Depends on
`@vireocodedev/starter-localization`, which owns the `platform` and `history`
translation namespaces this package renders.

The package ships unbundled: `dist` mirrors `src` file-for-file, so subpaths can
be imported directly (`@vireocodedev/starter-ui/utils/apiutils`) when pulling the
whole barrel — and its MUI graph — is not acceptable.

## What's included

- **Components** — `ResponsiveCard`, `AppCard*`, `SlidingScreenStack`,
  `MobileFormParts`, `ResponsiveMonthYearPicker`, `FormToggleButtonField`,
  `ManagementSearchToolbar`, `AppBottomDrawer`, `DelayedRender`, and
  `InputAutocomplete`.
- **Forms** — `FormShell`, `GuardedForm`, `ResponsiveFormOverlay`, form
  idempotency keys, and deferred success notifications.
- **Tables** — the management/server table system: `ManagementServerTable`,
  `RgoServerTableMobile`, `MobileTable*`, `TableActionCell`, skeletons, plus the
  infinite-scroll/table utils and `useMobileTableExpansion`; also the
  container-aware `ResponsiveTable` and mobile accordion cell helpers.
- **Providers** — `AppConfirmProvider`, `AppSnackbarProvider`,
  `AppMobileAttributeProvider`, `AppThemeColorMetaProvider`.
- **Hooks** — `useResponsiveProps`, `useAppPageContentLayout`,
  `usePageOverlayModes`, `useDelayedOverlayMount`, `useSingleFlightAction`,
  `useManagementTableState`, `useMediaQueryDevice`.
- **Overlays** — responsive side-panel/drawer frames, page-overlay controller,
  delayed mounting, and guarded mode switching.
- **Layout** — `AppPageContentLayoutContext`, layout utils + shell breakpoints,
  `PageBody`, and measured page-content mode.
- **Unsaved changes** — scoped registration, confirmation, and route-leave
  guard primitives for app composition roots.
- **Utils** — currency/date formatters, `downloadFile`.

## Notes

- Everything is a **named export** off the package root.
- The app retains only composition roots that supply app-specific policy and
  routing; the reusable form, overlay, table, and unsaved-change behavior lives
  in this package.

## Versioning contract

The exported surface is a contract (add = minor, remove/rename = major).
