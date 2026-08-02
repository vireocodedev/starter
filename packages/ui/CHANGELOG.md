# @vireocodedev/starter-ui

## 1.1.0

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

- ff3ada7: Build with `tsc` instead of Vite, and publish subpath exports.

  `dist` now mirrors `src` file-for-file rather than being a single rolled-up
  bundle, and the package exposes a `./*` subpath export alongside the `.` barrel.
  Consumers can import `@vireocodedev/starter-ui/utils/dateFormatters` directly —
  which matters for code reachable from web workers and other contexts where
  pulling the whole barrel (and its MUI graph) through the bundler is not
  acceptable.

  Relative specifiers in the emitted JS and `.d.ts` carry `.js` extensions, so
  `dist` resolves under Node's ESM loader as well as under bundlers.

  `sideEffects` becomes `["**/*.css"]` instead of `false`, so stylesheet imports
  survive tree-shaking once the package ships CSS.

  The `.` entry point is unchanged; existing barrel imports keep working.

## 1.0.4

### Patch Changes

- Updated dependencies [5315b5c]
  - @vireocodedev/starter-localization@0.7.0
  - @vireocodedev/starter-core@0.6.3

## 1.0.3

### Patch Changes

- Updated dependencies [957e1c8]
  - @vireocodedev/starter-localization@0.6.0
  - @vireocodedev/starter-core@0.6.2

## 1.0.2

### Patch Changes

- Updated dependencies [dfe6b35]
  - @vireocodedev/starter-localization@0.5.0
  - @vireocodedev/starter-core@0.6.1

## 1.0.1

### Patch Changes

- Updated dependencies [10c930e]
  - @vireocodedev/starter-localization@0.4.0
  - @vireocodedev/starter-core@0.6.0

## 1.0.0

### Major Changes

- 9f71a98: **Breaking:** the `history` translation namespace moved to
  `@vireocodedev/starter-localization`.

  `useHistoryTranslation`, `createHistoryResources`, `historyBaseResources`,
  `HISTORY_TRANSLATION_NAMESPACE` and the `HistoryResources` types are no longer
  exported from this package — import them from
  `@vireocodedev/starter-localization` instead. Translation keys are unchanged, so
  only import specifiers need updating.

### Patch Changes

- Updated dependencies [9f71a98]
  - @vireocodedev/starter-localization@0.3.0
  - @vireocodedev/starter-core@0.5.1

## 0.5.0

### Minor Changes

- cc8ae97: `MobileTableAccordionRow`'s row `Accordion` no longer wraps its summary title
  in an implicit `<h3>` (MUI's default `Accordion` heading slot). Mobile table
  rows render their title in a plain `<div>` via `slots={{ heading: "div" }}`,
  avoiding spurious headings in server-table mobile list views.

### Patch Changes

- Updated dependencies [cc8ae97]
  - @vireocodedev/starter-core@0.5.0

## 0.4.1

### Patch Changes

- Updated dependencies [b090ec4]
  - @vireocodedev/starter-history@0.3.0

## 0.4.0

### Minor Changes

- b2c2276: Consume `AppBottomDrawer` and the shell content-width constants from
  `@vireocodedev/starter-core` instead of bundling private copies. These two
  symbols are no longer re-exported from `@vireocodedev/starter-ui`; import them
  from `@vireocodedev/starter-core`. Also adds ported component tests
  (`useResponsiveProps`, `ResponsiveMonthYearPicker`).

## 0.3.0

### Minor Changes

- bfba3ea: Add the history viewer UI: the MUI history view components (`HistoryEntryCard`,
  `HistoryGroupView`, `HistoryNodeView`, `HistoryFieldRowView`, `HistoryValueContent`,
  `HistoryHoverableTableRow`, `HistoryTableColGroup`) and a dedicated `history` i18n
  namespace (`useHistoryTranslation`, `createHistoryResources`). Components build on
  the `@vireocodedev/starter-history` engine; the overlay shell stays app-side.

## 0.2.0

### Minor Changes

- b3c5e5f: Initial release of the MUI-based UI component library: responsive cards, the
  mobile/server management table system, overlays and app providers, layout
  context, formatters (currency/date), file download, and headless hooks
  (`useResponsiveProps`, `usePageOverlayModes`, `useSingleFlightAction`, …). Peers
  include `@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`,
  `@rgo/front-ui`, `react`, `react-hook-form`, `sonner`, and `dayjs`.
