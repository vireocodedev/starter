# @vireocodedev/starter-ui

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
