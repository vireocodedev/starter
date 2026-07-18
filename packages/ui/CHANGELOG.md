# @vireocodedev/starter-ui

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
