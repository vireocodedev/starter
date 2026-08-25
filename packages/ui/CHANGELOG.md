# @vireocodedev/starter-ui

## 7.0.0

### Major Changes

- 28b66bd: Use a full-screen dialog as the default mobile responsive-overlay surface while retaining the bottom drawer as an explicit option.
- 28b66bd: Remove the whole-form `form.ResetButton` contract and make `VireoFormActions` keep actions in one horizontal row. Ordinary action buttons now share the available width equally, while optional overflow icon buttons retain their intrinsic width.

### Minor Changes

- 28b66bd: Add the searchable, container-responsive VireoPreferencePanel application-preferences capability.
- 28b66bd: Add the router-agnostic `VireoMobileBottomNavigation` primitive with labelled controlled destinations, safe-area-aware shell presentation, public slots, theme integration, tests, and executable documentation.
- 28b66bd: Add the application-navigation capability with lockable, continuously resizable expanded and compact surfaces, full-width temporary mobile navigation, and mode-aware destination items.
- 28b66bd: Add persistent, form-aware responsive overlay actions with guarded cancellation, standardized scrolling, and semantic light/dark surface boundaries. Form sections now default to a flat divided presentation while retaining outlined and plain opt-in variants.

### Patch Changes

- 28b66bd: Fix `VireoSlidingScreenStack` so every retained screen occupies exactly one viewport width in flex and container-aware layouts.
- 28b66bd: Render every loaded mobile responsive-table row directly, restore independently stateful animated accordions without whole-list rerenders, and remove the TanStack Virtual peer dependency while preserving incremental loading and scroll restoration.
- 28b66bd: Fix `VireoPageBody` to apply its responsive theme spacing on every side while owning the underlying MUI container gutters.
- 28b66bd: Open page overlays without a mandatory animation-frame delay, preserve smooth initial desktop side-panel transitions, keep guarded overlay callbacks stable, and reduce hidden mobile responsive-table work.
- 28b66bd: Prevent ordinary two-line desktop table cells from showing a false `Show more` truncation action.
- 28b66bd: Keep confirmation dialog content mounted until its exit transition completes.
- 28b66bd: Keep every action visible in responsive table mobile rows when actions are grouped with MUI Stack.

## 6.0.0

### Major Changes

- d65fe29: Require i18next 26 and react-i18next 17 for Starter localization resources and React translation hooks.
- 75bf9c3: Upgrade the public MUI foundation to Material UI 9 and MUI X Date Pickers 9. Autocomplete and input slots now use the current MUI slot APIs, switch fields expose the semantic `switch` role, and temporal fields use MUI X's accessible segmented input structure.
- 1c5ba14: Require Zod 4.4 or newer and migrate the public schema contracts to Zod 4's type model.

### Patch Changes

- 4481d7b: Upgrade the internal error-boundary runtime to react-error-boundary 6 and safely handle unknown fallback errors.
- Updated dependencies [d65fe29]
- Updated dependencies [1c5ba14]
  - @vireocodedev/starter-localization@3.0.0
  - @vireocodedev/starter-history@3.0.0
  - @vireocodedev/starter-infrastructure@3.0.0
  - @vireocodedev/starter-queryengine@5.0.0

## 5.0.0

### Major Changes

- 72aac63: Complete the Vireo UI migration with first-class component contracts, container-responsive layouts, typed customization slots, dark-theme executable stories, and copy-pastable Storybook source across the public catalog.

  Replace the legacy Rgo and standalone-input APIs with the TanStack Form-based `useVireoForm` field family, standardized form layout and multi-step primitives, responsive overlays, page layout, tables, history presentation, infinite canvas, country flags, notifications, drag and drop, EventSource, and TanStack Query integrations. Remove obsolete compatibility components, React Hook Form plumbing, Axios ownership, and application-specific compositions.

### Patch Changes

- Updated dependencies [72aac63]
- Updated dependencies [72aac63]
- Updated dependencies [72aac63]
- Updated dependencies [72aac63]
  - @vireocodedev/starter-history@2.0.0
  - @vireocodedev/starter-infrastructure@2.0.0
  - @vireocodedev/starter-localization@2.0.0
  - @vireocodedev/starter-queryengine@4.0.0

## 4.1.0

### Minor Changes

- 1be3bb1: Add guarded forms, responsive autocomplete, overlays, tables, layout, and scoped unsaved-change primitives.

### Patch Changes

- Updated dependencies [56eaa3b]
  - @vireocodedev/starter-localization@1.1.0

## 4.0.1

### Patch Changes

- a486983: Remove tooltip from close button in RgoDialogHeader and fix dashed country codes to use underscores for flag component

## 4.0.0

### Major Changes

- dc5b42d: Milestone - collective major bump

### Patch Changes

- Updated dependencies [dc5b42d]
  - @vireocodedev/starter-history@1.0.0
  - @vireocodedev/starter-localization@1.0.0

## 3.2.0

### Minor Changes

- cd33fb5: Localise `RgoVideoStreamPlayer` error state.

  The stream error title, message and retry button were hardcoded English strings
  in a published component. They now go through `usePlatformTranslation` like every
  other component in the package, with a new `video` section added to the platform
  namespace in both `en` and `hr`.

  Closes gap F13 from the FRED paper prototype (roadmap 2.4, work item W6).

- cd33fb5: `useRgoSseEmitter`: dispatch to current handlers, and reconnect automatically.

  Two fixes and one addition.

  **Handlers are no longer frozen at mount.** `eventHandlers`, `onOpen`,
  `onMessage` and `onError` were captured on the first render behind four
  `react-hooks/exhaustive-deps` suppressions, so a handler that closed over state
  kept firing against the values it saw at mount. They are now read at dispatch
  time, and all four suppressions are gone. Replacing the `eventHandlers` object no
  longer tears down the connection either, so consumers no longer need to memoise
  it.

  **The stream now recovers on its own.** `EventSource` retries while a connection
  is merely dropped, but once it reports `CLOSED` the browser has given up and the
  stream stayed dead until something called `reconnect()` by hand. The hook now
  reconnects with exponential backoff, configurable through `reconnectBaseDelayMs`,
  `reconnectMaxDelayMs` and `maxRetries`, with `onReconnectAttempt` and
  `onReconnectFailed` callbacks. The manual `reconnect()` still works and resets
  the retry budget.

  **Added:** a `status` field on the return value (`"connecting" | "open" |
"reconnecting" | "closed"`) so a consumer can show a reconnecting indicator, and
  malformed event payloads now go to `onError` instead of throwing inside a
  listener where the browser swallows them.

  Additive — existing call sites keep working unchanged.

  Closes gaps G15 and the reconnect half of G14 from the LMS paper prototype
  (roadmap 2.4, work item W3). Missed-event replay is deliberately out of scope: it
  needs a `Last-Event-ID` contract the starter cannot decide on a consumer's
  behalf.

- cd33fb5: Add a typed application event bus.

  `front-ui` bundled `tseep` and the starter dropped it, so two of the three
  consumer apps rebuilt an event bus by hand — LMS through `front-ui`'s emitter,
  FRED as `olEventService` for cross-panel geometry coordination. Neither had a
  natural parent component to hang the coordination on, which is exactly the case
  this covers.

  Exports `RgoEventBus`, a shared `rgoEventBus` instance, and a
  `useRgoEventListener` hook that subscribes for a component's lifetime. Event
  names and payloads come from the augmentable `RgoEventRegistry` interface,
  following the same declaration-merging pattern as `RgoDroppableIdRegistry`:

  ```ts
  declare module "@vireocodedev/starter-ui" {
    interface RgoEventRegistry {
      "geometry:change": { featureId: string };
      "shift:ended": void;
    }
  }
  ```

  Implemented without a runtime dependency — the surface is four methods, and a
  published package should not pull a transitive dependency to provide them. A
  listener that throws is reported and skipped rather than cancelling delivery to
  the rest.

  Closes gaps G17, the bus half of F10, and the `tseep` part of G0 (roadmap 2.4,
  work item W4).

### Patch Changes

- Updated dependencies [cd33fb5]
  - @vireocodedev/starter-localization@0.10.0

## 3.1.0

### Minor Changes

- 95b8abb: Fix two published declarations that only compiled inside this repository.

  `useRgoTypedFieldArray` leaned on a `@ts-expect-error` above its return
  annotation. Suppressions do not travel into the emitted `.d.ts`, so the error
  they hid was live for every consumer and invisible to us. The signature now
  constrains its element type and spells the field name so the
  `FieldArrayPath` constraint is satisfied by construction.

  `RgoTranslationFn` was declared as `TFunction<typeof RGO_LOCALE_NAMESPACE>`. The
  `"rgo-ui"` namespace is declared in an ambient augmentation under `src/@types`,
  which `tsc` does not copy to `dist` — and shipping it is not an option, since it
  would overwrite the consumer's own `CustomTypeOptions.resources`. Any consumer
  that augments i18next narrows `Namespace` away from `string`, at which point the
  published type asserted a namespace they had never declared. It is now
  parameterised by `Namespace`.

  Minor rather than patch: `RgoTranslationFn` is exported and its shape changes,
  including where it appears as a default type parameter on `useRgoForm`.

## 3.0.0

### Major Changes

- 6394ad9: Remove `RgoOfflineCacheService` and the `idb` dependency.

  The service was an IndexedDB-backed offline cache. Offline persistence in the starter
  is now owned by `@vireocodedev/starter-sqlite` (SQLite over OPFS), so the two told
  contradictory stories about where offline data lives, and the IndexedDB path had no
  consumers.

  Removed along with it:

  - the `idb` runtime dependency
  - the IndexedDB-only helper types `IndexedDBEntity`, `EntityMap`, `ObjectStore` and
    `ObjectStoreIndex` from `utils/typeutils`
  - the `RgoWebWorkerService` documentation section, which documented a service that
    was never implemented

  Use `@vireocodedev/starter-sqlite` for offline persistence.

- a194df9: Remove duplicated exports so each symbol has exactly one home.

  **Breaking changes**

  - `@vireocodedev/starter-shell` no longer re-exports `AppBottomDrawer`, `AppBottomDrawerProps` or the `APP_PAGE_CONTENT_*` width constants. Import them from `@vireocodedev/starter-ui`, where they are defined.
  - `@vireocodedev/starter-ui` no longer exports `AppConfirmProvider`. It was a pass-through wrapper that rendered `RgoConfirmProvider` and added nothing — use `RgoConfirmProvider` directly.

- 04d26a3: Replace the `exports` wildcard with three declared entry points.

  `exports` previously mapped `"./*"` onto the build output, which made all 183 built modules public API. Any internal
  rename was therefore a breaking change, and the honest semver bump for almost any change was major. The map now
  declares exactly `.`, `./api` and `./country`; importing an undeclared internal path no longer resolves.

  **This is the breaking part.** Every symbol reachable through the old wildcard is still reachable — the six that the
  reference application used through deep paths (`endpoint`, `PageableParams`, `PageableResponse`, `zodParse`,
  `CountryCode`, `getCountryName`) were all already exported from the root barrel. Consumers using deep paths must
  repoint the import specifier; no symbol was removed or renamed.

  The two extra entry points exist for reasons the root barrel cannot serve:

  - **`./api`** is framework-free and safe to import from a Web Worker. The root barrel pulls in React, MUI and
    DOM-dependent providers, so a worker that imports it fails on load. This subpath re-exports the request and response
    helpers that the online and offline API modules share, and nothing else.
  - **`./country`** gives the API layer a narrow import for country data instead of the whole component library. It is
    **not** worker-safe: `RGO_COUNTRY_CODES` and `CountryCode` derive from `country-flag-icons/react`, so importing it
    evaluates React components.

  A new `entryPoints` test enforces both promises. It fails if a wildcard reappears, if an entry point points at a file
  the build does not produce, or if anything in the `./api` runtime graph reaches for React, MUI or the DOM. Its
  third-party surface is frozen to `axios` and `zod`, so a new runtime dependency has to be argued for rather than
  acquired by accident through a convenience import.

- 829c409: Consolidate toast notifications on `sonner` and drop the `react-hot-toast` dependency.

  The library previously shipped two competing toast stacks: `AppSnackbarProvider` (sonner) and `RgoSnackbarProvider` (react-hot-toast). `useRgoMutation` emitted its toasts through react-hot-toast, so any app mounting `AppSnackbarProvider` — the documented default — silently dropped every success and error toast.

  **Breaking changes**

  - `RgoSnackbarProvider` and `RgoSnackbarProviderProps` are removed. Use `AppSnackbarProvider`, which mounts sonner's `Toaster` with responsive placement and theme-aware colors.
  - `toast` is now re-exported from `sonner` instead of `react-hot-toast`. Replace `toast(<node />)` with `toast.custom(() => <node />)`, and prefer `toast.success` / `toast.error` / `toast.warning` for plain messages.

  `useRgoMutation` now renders through sonner, so its snackbars appear as intended.

- c49616c: Move `RgoVideoStreamPlayer` out of the root barrel and onto its own
  `@vireocodedev/starter-ui/video` entry point.

  **Breaking change**

  - `RgoVideoStreamPlayer` and `RgoVideoStreamPlayerProps` are no longer exported
    from `@vireocodedev/starter-ui`. Import them from
    `@vireocodedev/starter-ui/video`. Nothing about the component changed.

  **Why**

  `ovenplayer` is by a wide margin the heaviest dependency in this package, and
  until now every consumer of the root barrel pulled it into the module graph
  whether or not it rendered a stream. A bundler cannot reliably drop it either:
  the component imports its own stylesheet, and `ovenplayer` itself is not
  side-effect free, so removing it requires the consumer to declare the package's
  JavaScript side-effect free by hand.

  Behind a subpath the cost is structural rather than configuration-dependent — a
  consumer that never imports `./video` never resolves `ovenplayer` at all.

  `RgoClientTable`, the other component with no consumer today, stays in the root
  barrel. It carries no comparable transitive dependency, so moving it would trade
  a real import path for no saving.

### Patch Changes

- 3feef19: `handleBadRequestError` no longer throws when a 400 arrives without a response body.

  The guard read `error?.response.data`, so the optional chain stopped one level short:
  any 400-status error lacking a `response` (a synthesized error, an aborted request)
  raised a `TypeError` from inside the error handler instead of being ignored.

- 2b53a55: Fix documentation drift and add a contract test that prevents it recurring.

  A new `docsContract` test parses every `import ... from "@vireocodedev/starter-ui"` in the `.mdx` docs and in the
  Storybook code samples, and asserts the symbol is actually exported from the package barrel. It found eleven defects,
  all now corrected:

  - `RgoSseProvider` was documented as a provider but has never existed — the real API is the `useRgoSseEmitter` hook. The
    option table was already accurate and has been kept.
  - `RgoInitializable` was documented in nine places; the component is named `RgoInitializeProvider`.
  - `useSnackbar` was documented as a starter-ui export; toasts moved to sonner, so the example now uses `toast`.
  - `useTranslation` was documented as a starter-ui export; it comes from `react-i18next`.
  - `useTheme` was documented as a starter-ui export with a `{ toggleTheme, isDarkMode }` return that never existed. It is
    MUI's hook, and `RgoThemeProvider` does not manage colour mode — the dark-theme example now shows the real pattern.
  - `I18nTranslationFn` was referenced in four story samples; the exported type is `RgoTranslationFn`.
  - `RgoTabPanel` was shown as an import in the `useRgoTabs` example, but it is module-private; the example now uses the
    `TabPanel` returned by the hook.
  - The `RgoTablePagination` code sample was missing the commas in its import statement.
  - A `storybookutils` JSDoc example imported a nonexistent `Provider`.

- 829c409: Fix a layout height jump in the management server table by keeping the loading skeleton's row height in sync with the rendered table rows.
- Updated dependencies [a194df9]
- Updated dependencies [829c409]
  - @vireocodedev/starter-history@0.4.1
  - @vireocodedev/starter-localization@0.9.0

## 2.1.0

### Minor Changes

- ada88d7: Remove tseep dependency, add turbo for build

### Patch Changes

- Updated dependencies [ada88d7]
  - @vireocodedev/starter-localization@0.8.0
  - @vireocodedev/starter-history@0.4.0

## 2.0.0

### Major Changes

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
