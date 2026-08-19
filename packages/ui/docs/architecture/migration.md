# Architecture migration

## Purpose

This guide turns the target architecture into an incremental refactor plan. It separates the required destination from temporary legacy exceptions and records the initial ownership of every module currently under `packages/ui/src`.

No entry in this document makes legacy structure acceptable for new code.

## Migration policy

The architecture guides take effect immediately for new or relocated code. Existing violations may remain only when:

1. the migration inventory covers the path;
2. a machine-checkable violation is listed individually in the temporary architecture allowlist;
3. the change does not expand the violation;
4. the corresponding allowlist entry is removed when the module migrates.

The allowlist suppresses known paths, not entire rules. It must shrink over time.

## Implementation phases

### Phase 0: specification and inventory

- Publish the source, capability, component-category, and migration guides.
- Assign every current source module an intended owner or explicit deferred disposition.
- Keep source behavior and paths unchanged.

### Phase 1: authoring and enforcement foundations

- Update `generate react-component` to require an owner and approved category.
- Update `starter-ui-component-author` to read and enforce the architecture guides.
- Add filesystem architecture checks and import-boundary lint rules.
- Add an explicit legacy allowlist generated from reviewed violations.
- Configure Storybook to read package-wide MDX from `docs/storybook`.

### Phase 2: core

- Establish `core/public.ts` and approved structural folders.
- Migrate foundational components, hooks, providers, services, models, types, styles, and utilities as complete modules.
- Preserve root exports and thin Rgo compatibility names.

### Phase 3: capabilities

- Establish and migrate one complete capability at a time.
- Move its components, hooks, providers, state, tests, stories, and exports together.
- Resolve ownership exposed by each move instead of creating temporary shared folders.
- Remove the capability's legacy allowlist entries when complete.

The initial capability registry is:

```text
country
forms/form-overlays
history
infinite-canvas
overlays/confirmation
overlays/page-overlays
page-layout
table/management-table
table/responsive-table
unsaved-changes
```

### Phase 4: integrations

Design and migrate integrations only after core and capability boundaries stabilize. The current `features` folder is neither complete nor authoritative. The audit must include misplaced adapters such as `RgoVideoStreamPlayer` and its OvenPlayer runtime.

### Phase 5: compatibility cleanup

- Revisit deprecated Rgo aliases.
- Revisit the compatibility-only `./api` entry point.
- Reassess provisional event infrastructure and the SSE transport hook.
- Remove dead, duplicated, or superseded legacy modules through separately reviewed changes.

## Migration slice completion

A migration slice is complete only when:

- the whole selected module or capability has moved to its target owner;
- the supported package API remains compatible;
- internal imports no longer reference its legacy path;
- tests and stories move with their owner and pass;
- applicable allowlist entries are removed;
- architecture checks, linting, type-checking, and tests are green;
- this ledger is updated.

Parallel old and new implementations do not count as completion. Only deliberate thin compatibility exports may remain.

Avoid intentional behavior changes in structural migrations. Scope behavior or public API changes separately.

## Compatibility boundary

Structural migration protects:

- all symbols currently exported from the package root;
- every subpath explicitly declared in `package.json` exports.

Imports into `src` and undeclared implementation paths are not protected contracts.

The declared subpaths have these target dispositions:

| Subpath     | Disposition                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------- |
| `.`         | Re-export `core/public.ts` and each top-level capability public boundary directly.            |
| `./country` | Map to `capabilities/country/public.ts`.                                                      |
| `./video`   | Preserve while remapping to the deferred OvenPlayer integration boundary.                     |
| `./api`     | Preserve as a compatibility entry assembled from new owners; do not create an API capability. |

## Inventory conventions

Paths below are relative to `packages/ui/src`.

- `/**` covers an entire module directory, including its tests, styles, stories, and private support.
- `{A,B}` is an explicit brace set of alternatives. The future inventory verifier must expand it before matching.
- Rows must be exhaustive and non-overlapping. Every source file matches exactly one row.
- `Planned` means the target owner is agreed but no move has occurred.
- `Split` means one legacy module contains multiple responsibilities and must be separated during migration.
- `Deferred` means the owner cannot be finalized before the integrations or network audit.
- `Compatibility` means the path exists to protect a public entry rather than represent target ownership.

This baseline was reviewed on 2026-08-19. Update the ledger whenever a path is added, moved, split, or removed.

## Root and legacy area inventory

| Current path pattern                                                                                                | Target owner or location               | Disposition   | Notes                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `index.ts`                                                                                                          | Package root entry                     | Planned       | Will export `core/public.ts` and each top-level capability boundary directly.                                                          |
| `@types/i18n.d.ts`                                                                                                  | Deferred i18next integration           | Deferred      | Owner-located ambient augmentation.                                                                                                    |
| `@types/mui.d.ts`                                                                                                   | `core/types`                           | Planned       | Theme-system augmentation.                                                                                                             |
| `@types/rgo.d.ts`                                                                                                   | Package-wide root declaration          | Planned       | Retain only the global CSS import declaration.                                                                                         |
| `api/**`                                                                                                            | Compatibility entry                    | Compatibility | Preserve `./api`; remap symbols after `apiutils` is split.                                                                             |
| `core/public.ts`                                                                                                    | `core` public boundary                 | Migrated      | Re-exports completed core-owned public modules.                                                                                        |
| `capabilities/overlays/public.ts`                                                                                   | `capabilities/overlays`                | Migrated      | Curated package-facing boundary for completed overlay capability slices.                                                               |
| `capabilities/forms/public.ts`                                                                                      | `capabilities/forms`                   | Migrated      | Curated package-facing boundary for completed forms capability slices.                                                                 |
| `capabilities/overlays/constants/overlay.constants.ts`                                                              | `capabilities/overlays/constants`      | Migrated      | Shared overlay sizing and transition constants.                                                                                        |
| `capabilities/overlays/hooks/{useRafViewportWidth/useRafViewportWidth.ts,useSidePanelResize/useSidePanelResize.ts}` | `capabilities/overlays/hooks`          | Migrated      | Parent-owned viewport and resizing behavior.                                                                                           |
| `capabilities/overlays/types/overlay.types.ts`                                                                      | `capabilities/overlays/types`          | Migrated      | Shared overlay frame contracts.                                                                                                        |
| `capabilities/overlays/utils/overlay.utils.ts`                                                                      | `capabilities/overlays/utils`          | Migrated      | Pure overlay sizing calculations.                                                                                                      |
| `capabilities/overlays/page-overlays/contexts/PageOverlayControllerContext/**`                                      | `capabilities/overlays/page-overlays`  | Migrated      | Page-overlay controller context, consumer hook, and colocated tests.                                                                   |
| `capabilities/overlays/page-overlays/hooks/useGuardedOverlayModeSwitch/**`                                          | `capabilities/overlays/page-overlays`  | Migrated      | Unsaved-change-aware page-overlay mode switching and tests.                                                                            |
| `capabilities/overlays/page-overlays/providers/PageOverlayControllerProvider/**`                                    | `capabilities/overlays/page-overlays`  | Migrated      | Controller provider with its nonvisual registration and outlet companions.                                                             |
| `capabilities/unsaved-changes/public.ts`                                                                            | `capabilities/unsaved-changes`         | Migrated      | Curated package-facing boundary for completed unsaved-changes slices.                                                                  |
| `capabilities/unsaved-changes/contexts/UnsavedChangesContext/**`                                                    | `capabilities/unsaved-changes`         | Migrated      | Registry contracts, React contexts, consumer hooks, and colocated tests.                                                               |
| `capabilities/unsaved-changes/hooks/{useUnsavedChangesRegistration/**,useUnsavedChangesRequestDiscard/**}`          | `capabilities/unsaved-changes`         | Migrated      | Registration and discard-request hooks with colocated behavior tests.                                                                  |
| `capabilities/unsaved-changes/providers/UnsavedChangesScope/**`                                                     | `capabilities/unsaved-changes`         | Migrated      | Hierarchical scope provider and its colocated tests.                                                                                   |
| `core/utils/muiutils.ts`                                                                                            | `core/utils`                           | Migrated      | Shared Vireo authoring helpers and the preserved package-root utility API.                                                             |
| `core/hooks/useVireoIcons/**`                                                                                       | `core/hooks`                           | Migrated      | Canonical typed icon-registry consumer hook.                                                                                           |
| `core/providers/VireoIconRegistryProvider/**`                                                                       | `core/providers`                       | Migrated      | Canonical typed application icon registry and built-in definitions.                                                                    |
| `country/**`                                                                                                        | `capabilities/country`                 | Planned       | Preserve the declared `./country` subpath.                                                                                             |
| `enums/**`                                                                                                          | `core/models`                          | Planned       | `RgoMonth` is a runtime Zod model, not a folder category.                                                                              |
| `events/RgoEventBus.ts`                                                                                             | `core/events`                          | Planned       | Provisional migration of the in-process bus.                                                                                           |
| `events/useRgoEventListener.ts`                                                                                     | `core/hooks/useRgoEventListener`       | Planned       | Provisional consumer hook.                                                                                                             |
| `features/**`                                                                                                       | Deferred integration audit             | Deferred      | Most modules are adapters; extract capability-owned UI such as country/nationality components before designing integration boundaries. |
| `forms/**`                                                                                                          | `capabilities/forms`                   | Planned       | `ResponsiveFormOverlay` moves to child `form-overlays`.                                                                                |
| `history/**`                                                                                                        | `capabilities/history`                 | Planned       | History rendering capability.                                                                                                          |
| `inputs/**`                                                                                                         | `core/components/inputs`               | Planned       | Standalone value-level input behavior.                                                                                                 |
| `layout/**`                                                                                                         | `capabilities/page-layout`             | Planned       | Page-content layout, not a generic layout capability.                                                                                  |
| `table/**`                                                                                                          | `capabilities/table`                   | Split         | Parent table foundations plus `responsive-table` and `management-table`.                                                               |
| `video/**`                                                                                                          | Declared `./video` compatibility entry | Compatibility | Will map to the deferred OvenPlayer integration.                                                                                       |

## Component inventory

### Root component files

| Current path pattern                                         | Target owner                                              | Disposition   | Notes                                                 |
| ------------------------------------------------------------ | --------------------------------------------------------- | ------------- | ----------------------------------------------------- |
| `components/ResponsiveMonthYearPicker.tsx`                   | `core/components/inputs`                                  | Planned       | Classify and migrate with the remaining date inputs.  |
| `components/SlidingScreenStack.tsx`                          | `core/components/layout/VireoSlidingScreenStack`          | Compatibility | Thin deprecated alias for the canonical screen stack. |
| `components/DelayedRender.tsx`                               | `core/components/behavior/VireoDelayedRender`             | Compatibility | Thin deprecated alias.                                |
| `components/{FormToggleButtonField.tsx,MobileFormParts.tsx}` | `capabilities/forms/components/forms`                     | Planned       | Coupled to form state or form composition.            |
| `components/ManagementSearchToolbar.tsx`                     | `capabilities/table/management-table/components/controls` | Planned       | Management-table search workflow.                     |
| `components/ResponsiveCard.tsx`                              | `capabilities/page-layout/components/surfaces`            | Planned       | Behavior depends on page-content layout mode.         |

### Data-display components

| Current path pattern                                                               | Target owner                                 | Disposition   | Notes                                                                        |
| ---------------------------------------------------------------------------------- | -------------------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| `components/data-display/{RgoClientTable,RgoServerTable,RgoTable}/**`              | `capabilities/table/components/data-display` | Planned       | Parent-owned table foundations.                                              |
| `components/data-display/RgoVideoStreamPlayer/**`                                  | Deferred OvenPlayer integration              | Deferred      | Misplaced integration component.                                             |
| `components/data-display/{RgoTimeWithDateDisplay,RgoTimeWithDateDisplayInline}/**` | `core/components`                            | Split         | Classify the deferred date displays when their shared contract is revisited. |
| `components/data-display/RgoSnack/**`                                              | `core/components/feedback/VireoSnack`        | Compatibility | Thin deprecated alias for the canonical notification content surface.        |
| `components/data-display/RgoIcon/**`                                               | `core/components/data-display/VireoIcon`     | Compatibility | Thin deprecated alias for the canonical registry-backed icon.                |

### Feedback, input, layout, navigation, and utility components

| Current path pattern                                                       | Target owner                                           | Disposition   | Notes                                                                     |
| -------------------------------------------------------------------------- | ------------------------------------------------------ | ------------- | ------------------------------------------------------------------------- |
| `components/feedback/{RgoLoader,RgoQueryErrorLoaderSuspense}/**`           | `core/components/feedback`                             | Planned       | Generic loading, suspense, and error-boundary presentation.               |
| `components/inputs/RgoForm/**`                                             | `capabilities/forms/components/forms`                  | Planned       | Form workflow component.                                                  |
| `components/inputs/RgoIconButton/**`                                       | `core/components/controls/VireoLabeledIconButton`      | Compatibility | Deprecated adapter for the canonical labelled icon action.                |
| `components/inputs/RgoInput*/**`                                           | `core/components/inputs`                               | Planned       | Controlled value-level inputs; excludes `RgoForm`.                        |
| `components/layout/RgoFormSection/RgoFormSection.tsx`                      | `capabilities/forms/components/forms/VireoFormSection` | Compatibility | Deprecated adapter for the canonical form section.                        |
| `components/layout/RgoInfiniteCanvas/**`                                   | `capabilities/infinite-canvas/components/layout`       | Planned       | Canvas capability and its private pieces.                                 |
| `components/layout/RgoPage*/**`                                            | `capabilities/page-layout/components/layout`           | Planned       | Page shell, body, and header.                                             |
| `components/navigation/RgoTabs/RgoTabs.tsx`                                | `core/components/navigation/VireoTabs`                 | Compatibility | Deprecated adapter retaining the index and URL-state API.                 |
| `core/components/behavior/VireoDelayedRender/**`                           | `core/components/behavior`                             | Migrated      | First complete core component migration slice.                            |
| `core/components/controls/VireoLabeledIconButton/**`                       | `core/components/controls`                             | Migrated      | Accessible icon-over-label action with selected and status states.        |
| `core/components/data-display/VireoLabelBox/**`                            | `core/components/data-display`                         | Migrated      | Canonical labelled-content anatomy.                                       |
| `core/components/data-display/VireoJsonViewer/**`                          | `core/components/data-display`                         | Migrated      | Resilient structured-data inspection and copy behavior.                   |
| `core/components/data-display/VireoIcon/**`                                | `core/components/data-display`                         | Migrated      | Typed registry-backed icon rendering and theme integration.               |
| `core/components/data-display/VireoStopwatch/**`                           | `core/components/data-display`                         | Migrated      | Live and completed elapsed-duration presentation with timer semantics.    |
| `core/components/data-display/VireoTruncatedContent/**`                    | `core/components/data-display`                         | Migrated      | Accessible disclosure for overflowing rich content.                       |
| `core/components/feedback/VireoStatusDot/**`                               | `core/components/feedback`                             | Migrated      | Theme-aware semantic status marker with a preserved `RgoStatusDot` alias. |
| `core/components/feedback/VireoSnack/**`                                   | `core/components/feedback`                             | Migrated      | Semantic notification content with adornments and theme variants.         |
| `core/components/layout/VireoSlidingScreenStack/**`                        | `core/components/layout`                               | Migrated      | Controlled horizontal transitions that retain adjacent screens.           |
| `core/components/inputs/VireoTextInput/**`                                 | `core/components/inputs`                               | Migrated      | Controlled text input with a direct value-level change contract.          |
| `core/components/inputs/VireoNumberInput/**`                               | `core/components/inputs`                               | Migrated      | Controlled numeric input with safe parsing and bounds.                    |
| `core/components/inputs/VireoPasswordInput/**`                             | `core/components/inputs`                               | Migrated      | Controlled password input with accessible visibility controls.            |
| `core/components/inputs/VireoCounterInput/**`                              | `core/components/inputs`                               | Migrated      | Bounded numeric entry with accessible step actions.                       |
| `core/components/inputs/VireoDateInput/**`                                 | `core/components/inputs`                               | Migrated      | Timestamp-backed calendar date input with normalized validation wiring.   |
| `core/components/inputs/VireoAutocomplete/**`                              | `core/components/inputs`                               | Planned       | Canonical single-selection autocomplete contract.                         |
| `core/components/inputs/VireoAutocompleteMultiple/**`                      | `core/components/inputs`                               | Planned       | Canonical multiple-selection autocomplete contract.                       |
| `core/components/inputs/VireoFreeSoloAutocomplete/**`                      | `core/components/inputs`                               | Planned       | Canonical free-solo autocomplete contract.                                |
| `core/components/inputs/VireoFreeSoloAutocompleteMultiple/**`              | `core/components/inputs`                               | Planned       | Canonical multiple free-solo autocomplete contract.                       |
| `core/components/inputs/VireoDateTimeInput/**`                             | `core/components/inputs`                               | Planned       | Canonical timestamp-backed date-time input contract.                      |
| `core/components/inputs/VireoDurationInput/**`                             | `core/components/inputs`                               | Planned       | Canonical numeric duration input contract.                                |
| `core/components/inputs/VireoSelectInput/**`                               | `core/components/inputs`                               | Planned       | Canonical single-selection input contract.                                |
| `core/components/inputs/VireoSelectMultipleInput/**`                       | `core/components/inputs`                               | Planned       | Canonical multiple-selection input contract.                              |
| `core/components/inputs/VireoTimeInput/**`                                 | `core/components/inputs`                               | Planned       | Canonical timestamp-backed time input contract.                           |
| `core/components/inputs/VireoSwitchInput/**`                               | `core/components/inputs`                               | Migrated      | Controlled boolean field with label and validation anatomy.               |
| `core/components/inputs/VireoToggleButtonGroup/**`                         | `core/components/inputs`                               | Migrated      | Generic single- and multi-select toggle-button field.                     |
| `core/components/inputs/VireoSliderInput/**`                               | `core/components/inputs`                               | Migrated      | Synchronized slider and bounded numeric entry.                            |
| `core/components/navigation/VireoTabs/**`                                  | `core/components/navigation`                           | Migrated      | Accessible controlled and uncontrolled tab-to-panel navigation.           |
| `core/components/surfaces/VireoIconContainer/**`                           | `core/components/surfaces`                             | Migrated      | Canonical icon-geometry normalization surface.                            |
| `capabilities/overlays/components/overlays/VireoOverlayHeader/**`          | `capabilities/overlays/components/overlays`            | Migrated      | Canonical overlay header anatomy.                                         |
| `capabilities/overlays/components/overlays/VireoSidePanelResizeHandle/**`  | `capabilities/overlays/components/overlays`            | Migrated      | Canonical pointer resize target with an unprefixed compatibility alias.   |
| `capabilities/overlays/components/overlays/VireoDockedSidePanel/**`        | `capabilities/overlays/components/overlays`            | Migrated      | Canonical docked panel layout and transition surface.                     |
| `capabilities/overlays/components/overlays/VireoBottomDrawer/**`           | `capabilities/overlays/components/overlays`            | Migrated      | Canonical swipeable mobile bottom-sheet surface.                          |
| `capabilities/overlays/components/overlays/VireoResponsiveOverlayFrame/**` | `capabilities/overlays/components/overlays`            | Migrated      | Responsive mobile and desktop overlay-surface coordinator.                |
| `capabilities/forms/components/forms/VireoFormSection/**`                  | `capabilities/forms/components/forms`                  | Migrated      | Accessible labelled grouping and surface for related form controls.       |

## Hook inventory

| Current path pattern                                                                                                                                                          | Target owner                                             | Disposition   | Notes                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------- | --------------------------------------------------------------- |
| `hooks/useAppPageContentLayout.ts`                                                                                                                                            | `capabilities/page-layout/hooks/useAppPageContentLayout` | Planned       | Page-layout context consumer.                                   |
| `hooks/{useDelayedOverlayMount.ts,usePageOverlayModes.ts}`                                                                                                                    | `capabilities/overlays/page-overlays/hooks`              | Planned       | Page-overlay lifecycle and modes.                               |
| `hooks/useManagementTableState.ts`                                                                                                                                            | `capabilities/table/management-table/hooks`              | Planned       | Management table state.                                         |
| `hooks/{useMediaQueryDevice.ts,useResponsiveProps.ts,useSingleFlightAction.ts}`                                                                                               | `core/hooks`                                             | Planned       | Foundational generic hooks.                                     |
| `hooks/useRgoConfirm/**`                                                                                                                                                      | `capabilities/overlays/confirmation/hooks`               | Planned       | Confirmation workflow.                                          |
| `hooks/{useRgoDependentFieldValidation,useRgoForm,useRgoMultiStepForm,useRgoTypedFieldArray,useRgoTypedForm}/**`                                                              | `capabilities/forms/hooks`                               | Planned       | Form-state behavior; multi-step remains parent-owned initially. |
| `hooks/useRgoInfiniteCanvas/**`                                                                                                                                               | `capabilities/infinite-canvas/hooks`                     | Planned       | Moves with the canvas capability.                               |
| `hooks/useRgoMutation/**`                                                                                                                                                     | Deferred TanStack Query integration                      | Deferred      | Query mutation behavior is integration-bound.                   |
| `hooks/useRgoSseEmitter/**`                                                                                                                                                   | Deferred network/integration audit                       | Deferred      | Not part of the in-process event bus.                           |
| `hooks/{useRgoAutoDismiss,useRgoContainerSize,useRgoDebounce,useRgoDownloadFn,useRgoFadePresence,useRgoFullscreenListener,useRgoResizeListener,useRgoTabs,useRgoUrlState}/**` | `core/hooks`                                             | Planned       | Generic design-system or browser behavior.                      |
| `hooks/useRgoIcons/**`                                                                                                                                                        | `core/hooks/useVireoIcons`                               | Compatibility | Deprecated hook alias and legacy documentation stories.         |

## Provider, service, and setup inventory

| Current path pattern                                                                                         | Target owner                                   | Disposition   | Notes                                                                 |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ------------- | --------------------------------------------------------------------- |
| `providers/{AppMobileAttributeProvider.tsx,AppThemeColorMetaProvider.tsx,RgoProviders.tsx,RgoProviders.mdx}` | `core/providers`                               | Planned       | Foundational provider composition and document/theme behavior.        |
| `providers/AppSnackbarProvider.tsx`                                                                          | Deferred Sonner integration                    | Deferred      | Third-party notification delivery.                                    |
| `providers/RgoConfirmProvider/**`                                                                            | `capabilities/overlays/confirmation/providers` | Planned       | Confirmation workflow owner.                                          |
| `providers/createRgoFormDialogProvider/**`                                                                   | `capabilities/forms/form-overlays/providers`   | Planned       | Form-owned overlay composition.                                       |
| `providers/{RgoInitializeProvider,RgoThemeProvider}/**`                                                      | `core/providers`                               | Planned       | Foundational lifecycle and theme providers.                           |
| `providers/RgoIconsProvider/**`                                                                              | `core/providers/VireoIconRegistryProvider`     | Compatibility | Deprecated provider alias and legacy documentation.                   |
| `providers/RgoLocalizationProvider/**`                                                                       | Deferred i18next/dayjs/MUI integration         | Deferred      | Integration-owned initialization.                                     |
| `providers/RgoQueryClientProvider/**`                                                                        | Deferred TanStack Query integration            | Deferred      | Integration-owned provider.                                           |
| `services/**`                                                                                                | `core/services`                                | Planned       | Current local-storage service is foundational browser infrastructure. |
| `setup/config/RgoLocale.ts`                                                                                  | Deferred i18next integration                   | Deferred      | Locale contracts and mappings.                                        |
| `setup/config/hooks/**`                                                                                      | Deferred i18next integration                   | Deferred      | Translation behavior.                                                 |
| `setup/translations/**`                                                                                      | Deferred i18next integration                   | Deferred      | Translation resources.                                                |

## Utility inventory

| Current path pattern                                                                                                                                                                                                                                              | Target owner or location                                  | Disposition | Notes                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| `utils/apiutils.ts`                                                                                                                                                                                                                                               | Table, core, Axios integration, and `./api` compatibility | Split       | Separate pagination contracts, pure helpers, and Axios behavior.                                         |
| `utils/countryutils.ts`                                                                                                                                                                                                                                           | `capabilities/country`                                    | Planned     | Country codes, names, and flag lookup.                                                                   |
| `utils/formutils.ts`                                                                                                                                                                                                                                              | `capabilities/forms` and core input contracts             | Split       | Form contracts move to forms; generic controlled-input contracts move with core inputs.                  |
| `utils/{markdownutils.ts,storybookutils.tsx}`                                                                                                                                                                                                                     | Package Storybook support outside `src`                   | Planned     | Story-only tooling is not production core.                                                               |
| `utils/{arrayutils.ts,consoleutils.ts,createApiMessageResolver.ts,currencyFormatters.ts,date.ts,dateFormatters.ts,debounce.ts,downloadFile.ts,iconutils.ts,mathutils.ts,muiutils.ts,objectutils.ts,strings.ts,themeutils.ts,tsutils.ts,typeutils.ts,zodutils.ts}` | `core` structural folders                                 | Split       | Classify each by meaning into constants, models, types, or utils; do not recreate a generic root bucket. |

## Ownership decisions recorded by this baseline

- `table`, `overlays`, `forms`, `unsaved-changes`, `history`, `page-layout`, `infinite-canvas`, and `country` are top-level capabilities.
- `responsive-table`, `management-table`, `page-overlays`, `confirmation`, and `form-overlays` are child capabilities.
- Generic inputs, navigation, feedback, icons, theming, responsive helpers, browser services, and pure utilities are core-owned.
- `layout`, `navigation`, `feedback`, `inputs`, `providers`, `api`, `video`, and `events` are not initial top-level capabilities.
- Integrations are migrated last and require their own architecture design.

## Completed migration slices

| Completed on | Source                                                                                                                                      | Destination                                                                                                      | Notes                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 2026-08-19   | `src/docs/**`                                                                                                                               | `docs/storybook`                                                                                                 | Package-wide Storybook MDX now lives outside the production source tree.            |
| 2026-08-19   | `components/utility/VireoDelayedRender/**`                                                                                                  | `core/components/behavior/VireoDelayedRender`                                                                    | Component, tests, story, exports, and Vireo authoring utilities moved together.     |
| 2026-08-19   | `components/data-display/{RgoIconContainer,VireoIconContainer}/**`                                                                          | `core/components/surfaces/VireoIconContainer`                                                                    | Removed the duplicate Rgo implementation and preserved its package-root aliases.    |
| 2026-08-19   | `components/data-display/{RgoLabelBox,VireoLabelBox}/**`                                                                                    | `core/components/data-display/VireoLabelBox`                                                                     | Removed deep legacy alias imports and preserved package-root aliases.               |
| 2026-08-19   | `components/data-display/VireoTruncatedContent/**`                                                                                          | `core/components/data-display/VireoTruncatedContent`                                                             | Moved the complete Vireo module; retained distinct legacy `RgoTruncatedText`.       |
| 2026-08-19   | `overlay/VireoOverlayHeader/**`                                                                                                             | `capabilities/overlays/components/overlays/VireoOverlayHeader`                                                   | Established the overlays boundary and moved the complete Vireo module.              |
| 2026-08-19   | `overlay/{overlay.constants.ts,overlay.types.ts,overlay.utils.ts,useRafViewportWidth.ts,useSidePanelResize.ts}`                             | `capabilities/overlays/{constants,hooks,types,utils}`                                                            | Moved the complete parent-owned overlay support slice.                              |
| 2026-08-19   | `overlay/{PageOverlayControllerContext.ts,useGuardedOverlayModeSwitch.ts}`                                                                  | `capabilities/overlays/page-overlays/{contexts,hooks}`                                                           | Moved both child modules with their tests.                                          |
| 2026-08-19   | `unsaved-changes/UnsavedChangesContext.ts`                                                                                                  | `capabilities/unsaved-changes/contexts/UnsavedChangesContext`                                                    | Established the dependency boundary and moved its registry tests.                   |
| 2026-08-19   | `overlay/PageOverlayController.tsx`                                                                                                         | `capabilities/overlays/page-overlays/providers/PageOverlayControllerProvider`                                    | Kept the tightly coupled nonvisual companion APIs with their provider.              |
| 2026-08-19   | `unsaved-changes/{UnsavedChangesScope.tsx,useUnsavedChangesRegistration.ts,useUnsavedChangesRequestDiscard.ts}`                             | `capabilities/unsaved-changes/{providers,hooks}`                                                                 | Completed the capability, its public boundary, and focused behavior tests.          |
| 2026-08-19   | `overlay/SidePanelResizeHandle.tsx`                                                                                                         | `capabilities/overlays/components/overlays/VireoSidePanelResizeHandle`                                           | Added the full Vireo contract and retained the former name as an alias.             |
| 2026-08-19   | `overlay/DockedSidePanel.tsx`                                                                                                               | `capabilities/overlays/components/overlays/VireoDockedSidePanel`                                                 | Added the full Vireo contract and retained the former name as an adapter.           |
| 2026-08-19   | `components/AppBottomDrawer.tsx`                                                                                                            | `capabilities/overlays/components/overlays/VireoBottomDrawer`                                                    | Added the full Vireo contract and retained the former name as an adapter.           |
| 2026-08-19   | `overlay/ResponsiveOverlayFrame.tsx`                                                                                                        | `capabilities/overlays/components/overlays/VireoResponsiveOverlayFrame`                                          | Added the full Vireo contract and retained the former name as an adapter.           |
| 2026-08-19   | `components/feedback/RgoDrawer/**`                                                                                                          | Removed                                                                                                          | Removed unused legacy drawer; supported behavior lives in overlay primitives.       |
| 2026-08-19   | `components/feedback/RgoDialogHeader/**`                                                                                                    | Removed                                                                                                          | Migrated Starter consumers to `VireoOverlayHeader` and removed the legacy API.      |
| 2026-08-19   | `components/data-display/RgoJsonViewerDialog/**`                                                                                            | Removed                                                                                                          | Deferred dialog composition to owning consumers.                                    |
| 2026-08-19   | `components/data-display/RgoJsonViewer/**`                                                                                                  | `core/components/data-display/VireoJsonViewer`                                                                   | Added the full Vireo contract and retained `RgoJsonViewer` as an adapter.           |
| 2026-08-19   | `components/data-display/RgoStatusDot/**`                                                                                                   | `core/components/feedback/VireoStatusDot`                                                                        | Added the full Vireo contract and retained `RgoStatusDot` as a package alias.       |
| 2026-08-19   | `components/data-display/RgoStatusText/**`                                                                                                  | Removed                                                                                                          | Removed an unused composition; consumers can combine `VireoStatusDot` with text.    |
| 2026-08-19   | `components/data-display/RgoStopwatch/**`                                                                                                   | `core/components/data-display/VireoStopwatch`                                                                    | Added the full Vireo contract and retained `RgoStopwatch` as a package alias.       |
| 2026-08-19   | `components/data-display/RgoValueWithUnit/**`                                                                                               | Removed                                                                                                          | Removed a trivial value-and-unit composition better owned by consumers.             |
| 2026-08-19   | `components/data-display/RgoPdfFrame/**`                                                                                                    | Removed                                                                                                          | Removed the unused browser-native PDF iframe and loader composition.                |
| 2026-08-19   | `components/data-display/RgoTruncatedText/**`                                                                                               | Removed                                                                                                          | Removed the superseded text-only truncation component; use `VireoTruncatedContent`. |
| 2026-08-19   | `components/AppCardActions.tsx`                                                                                                             | Removed                                                                                                          | Removed an unused application-styled wrapper around MUI `CardActions`.              |
| 2026-08-19   | `components/AppCardContent.tsx`                                                                                                             | Removed                                                                                                          | Removed an unused application-styled wrapper around MUI `CardContent`.              |
| 2026-08-19   | `components/inputs/RgoButtonBase/**`                                                                                                        | Removed                                                                                                          | Removed an unused wrapper with ambiguous non-button default semantics.              |
| 2026-08-19   | `components/utility/RgoShowIf/**`                                                                                                           | Removed                                                                                                          | Removed a conditional-rendering wrapper better expressed with ordinary JSX.         |
| 2026-08-19   | `components/data-display/RgoSnackDetailsButton/**`                                                                                          | Removed                                                                                                          | Kept mutation error details private to their integration-bound consumer.            |
| 2026-08-19   | `components/data-display/RgoSnack/**`                                                                                                       | `core/components/feedback/VireoSnack`                                                                            | Added the complete Vireo contract and retained `RgoSnack` as a deprecated alias.    |
| 2026-08-19   | `components/inputs/RgoIconButton/**`                                                                                                        | `core/components/controls/VireoLabeledIconButton`                                                                | Added the complete Vireo contract and retained a deprecated compatibility adapter.  |
| 2026-08-19   | `components/data-display/RgoIcon/**`, `hooks/useRgoIcons/**`, `providers/RgoIconsProvider/**`, `setup/config/{RgoIconRegistry.ts,icons/**}` | `core/components/data-display/VireoIcon`, `core/hooks/useVireoIcons`, `core/providers/VireoIconRegistryProvider` | Added the complete Vireo icon contract and retained deprecated registry aliases.    |
| 2026-08-19   | `components/SlidingScreenStack.tsx`                                                                                                         | `core/components/layout/VireoSlidingScreenStack`                                                                 | Added the complete Vireo contract and retained a deprecated compatibility alias.    |
| 2026-08-19   | `components/navigation/RgoTabs/**`                                                                                                          | `core/components/navigation/VireoTabs`                                                                           | Added the complete Vireo contract and retained a deprecated compatibility adapter.  |
| 2026-08-19   | `components/inputs/RgoInputText/**`                                                                                                         | `core/components/inputs/VireoTextInput`                                                                          | Added the complete Vireo contract and retained a deprecated compatibility adapter.  |
| 2026-08-19   | `components/inputs/RgoInputNumber/**`                                                                                                       | `core/components/inputs/VireoNumberInput`                                                                        | Added the complete Vireo contract and retained a deprecated compatibility adapter.  |
| 2026-08-19   | `components/inputs/RgoInputPassword/**`                                                                                                     | `core/components/inputs/VireoPasswordInput`                                                                      | Added the complete Vireo contract and retained a deprecated compatibility adapter.  |
| 2026-08-19   | `components/inputs/RgoInputCounter/**`                                                                                                      | `core/components/inputs/VireoCounterInput`                                                                       | Added the complete Vireo contract and retained a deprecated compatibility adapter.  |
| 2026-08-19   | `components/inputs/RgoInputSwitch/**`                                                                                                       | `core/components/inputs/VireoSwitchInput`                                                                        | Added the complete Vireo contract and retained a deprecated compatibility adapter.  |
| 2026-08-19   | `components/inputs/RgoInputToggleButtonGroup/**`                                                                                            | `core/components/inputs/VireoToggleButtonGroup`                                                                  | Added the complete generic Vireo contract and retained a deprecated adapter.        |
| 2026-08-19   | `components/inputs/RgoInputSlider/**`                                                                                                       | `core/components/inputs/VireoSliderInput`                                                                        | Added the complete Vireo contract and retained a deprecated compatibility adapter.  |
| 2026-08-19   | `components/layout/RgoFormSection/**`                                                                                                       | `capabilities/forms/components/forms/VireoFormSection`                                                           | Established forms and retained a deprecated compatibility adapter.                  |
| 2026-08-19   | `components/layout/RgoFormSectionGrid/**`                                                                                                   | Removed                                                                                                          | Replaced the trivial wrapper with direct MUI Grid2 composition.                     |
| 2026-08-19   | `components/inputs/RgoInputDate/**`                                                                                                         | `core/components/inputs/VireoDateInput`                                                                          | Added the complete Vireo contract and retained a deprecated compatibility adapter.  |

## Automated verification

`npm run test:architecture` now checks that:

1. expands inventory brace sets;
2. enumerates every file under `packages/ui/src`;
3. fails when a file matches zero rows;
4. fails when a file matches more than one row;
5. reports stale patterns that match nothing.

It also enforces the target source root, capability depth, structural folders, component categories, Vireo root contract, barrel placement, import boundaries, sibling isolation, and acyclic capability dependencies wherever target-architecture code exists.

Legacy source-location violations are recorded as exact file paths in `packages/ui/architecture.allowlist.json`. Adding another file beneath an existing legacy module therefore fails rather than silently expanding a broad directory exception. Inventory, target-structure, Vireo, and dependency violations cannot be allowlisted.
