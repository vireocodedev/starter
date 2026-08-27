# @vireocodedev/ui

The **MUI-based Vireo component library** for the vireocodedev **starter** product,
including TanStack-bound forms, responsive tables, overlays, page layout,
typed integrations, foundational providers, hooks, and formatters.

> This package takes `@mui/*` as **peer dependencies** — it is tied to the
> starter design system, not a generic component kit.

## Install

```bash
npm install @vireocodedev/ui
```

The package is published publicly on npm; installation requires no registry
authentication.

Peers: `react`, `react-dom`, `@mui/material`, `@mui/icons-material`,
`@mui/x-date-pickers`, `@emotion/react`, `@emotion/styled`,
`@tanstack/react-query`, `i18next`,
`react-i18next`, `zod`, `sonner`, `dayjs`. Depends on
`@vireocodedev/localization`, which owns the `platform` and `history`
translation namespaces this package renders.

The package ships unbundled: `dist` mirrors `src` file-for-file. Supported
consumer entry points are nevertheless limited to the package root and the
subpaths declared in `package.json`; undeclared implementation paths are not a
compatibility contract.

TypeScript declarations are verified from the packed artifact with TypeScript
6, `moduleResolution: "Bundler"`, and `skipLibCheck: false`. This file-for-file
package intentionally omits source maps; its public source remains available in
the repository.

## What's included

- **Components** — Vireo form fields and layout primitives, responsive cards,
  tables, overlays, navigation, feedback, and data-display components.
- **Forms** — `useVireoForm`, its bound `form.*` and `field.*` APIs, and
  `VireoResponsiveFormOverlay`.
- **Tables** — `VireoResponsiveTable`, the typed container-aware desktop table
  and mobile accordion contract with controlled sorting, pagination, loading,
  filtering surfaces, incremental mobile loading, and scroll restoration.
- **Providers** — `VireoConfirmationProvider`, `VireoIconRegistryProvider`,
  `VireoProviderComposer`, and `VireoThemeColorMeta`.
- **Localization integrations** — temporal picker localization under
  `/localization` and namespace-bound React hooks under `/react-i18next`.
- **Hooks** — `useVireoDebouncedCallback`, `useVireoFullscreen`,
  `useVireoTransitionPresence`, `useAppPageContentLayout`,
  `usePageOverlayModes`, and `useDelayedOverlayMount`.
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
- `VireoTemporalLocalizationProvider` initializes the bundled Day.js UTC plugin
  plus English/Croatian locale data. Canonical `time` values use `HH:mm:ss` and
  canonical `date-time` values use `YYYY-MM-DDTHH:mm:ss`, including `:00` when
  the field uses its default minute precision. Applications own timezone
  conversion and must import any additional Day.js locale pack they select.

## Architecture and authoring

The architecture guides describe the required destination for the ongoing
source migration. Existing legacy paths are tracked explicitly; new and moved
code must follow the target structure.

- [Source structure](./docs/architecture/source-structure.md)
- [Capability structure](./docs/architecture/capability-structure.md)
- [Component folder categories](./docs/architecture/component-folder-categories.md)
- [Migration and current-source inventory](./docs/architecture/migration.md)
- [Vireo component authoring](./docs/component-authoring/component-files.md)
- [Vireo story coverage rulebook](./docs/component-authoring/story-coverage-rulebook.md)
- [Motion and interaction language](./docs/storybook/MotionGuide.mdx)

## Versioning contract

The exported surface is a contract (add = minor, remove/rename = major).
