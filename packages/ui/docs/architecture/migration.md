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

| Current path pattern                                                                                                                                                                     | Target owner or location               | Disposition   | Notes                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `index.ts`                                                                                                                                                                               | Package root entry                     | Planned       | Will export `core/public.ts` and each top-level capability boundary directly.                                                          |
| `@types/i18n.d.ts`                                                                                                                                                                       | Deferred i18next integration           | Deferred      | Owner-located ambient augmentation.                                                                                                    |
| `@types/mui.d.ts`                                                                                                                                                                        | `core/types`                           | Planned       | Theme-system augmentation.                                                                                                             |
| `@types/rgo.d.ts`                                                                                                                                                                        | Package-wide root declaration          | Planned       | Retain only the global CSS import declaration.                                                                                         |
| `api/**`                                                                                                                                                                                 | Compatibility entry                    | Compatibility | Preserve `./api`; remap symbols after `apiutils` is split.                                                                             |
| `core/public.ts`                                                                                                                                                                         | `core` public boundary                 | Migrated      | Re-exports completed core-owned public modules.                                                                                        |
| `capabilities/overlays/public.ts`                                                                                                                                                        | `capabilities/overlays`                | Migrated      | Curated package-facing boundary for completed overlay capability slices.                                                               |
| `core/utils/muiutils.ts`                                                                                                                                                                 | `core/utils`                           | Migrated      | Shared Vireo authoring helpers and the preserved package-root utility API.                                                             |
| `country/**`                                                                                                                                                                             | `capabilities/country`                 | Planned       | Preserve the declared `./country` subpath.                                                                                             |
| `enums/**`                                                                                                                                                                               | `core/models`                          | Planned       | `RgoMonth` is a runtime Zod model, not a folder category.                                                                              |
| `events/RgoEventBus.ts`                                                                                                                                                                  | `core/events`                          | Planned       | Provisional migration of the in-process bus.                                                                                           |
| `events/useRgoEventListener.ts`                                                                                                                                                          | `core/hooks/useRgoEventListener`       | Planned       | Provisional consumer hook.                                                                                                             |
| `features/**`                                                                                                                                                                            | Deferred integration audit             | Deferred      | Most modules are adapters; extract capability-owned UI such as country/nationality components before designing integration boundaries. |
| `forms/**`                                                                                                                                                                               | `capabilities/forms`                   | Planned       | `ResponsiveFormOverlay` moves to child `form-overlays`.                                                                                |
| `history/**`                                                                                                                                                                             | `capabilities/history`                 | Planned       | History rendering capability.                                                                                                          |
| `inputs/**`                                                                                                                                                                              | `core/components/inputs`               | Planned       | Standalone value-level input behavior.                                                                                                 |
| `layout/**`                                                                                                                                                                              | `capabilities/page-layout`             | Planned       | Page-content layout, not a generic layout capability.                                                                                  |
| `overlay/{DockedSidePanel.tsx,ResponsiveOverlayFrame.tsx,SidePanelResizeHandle.tsx,overlay.constants.ts,overlay.types.ts,overlay.utils.ts,useRafViewportWidth.ts,useSidePanelResize.ts}` | `capabilities/overlays`                | Planned       | Parent-owned overlay frames, sizing, and shared contracts.                                                                             |
| `overlay/{PageOverlayController.tsx,PageOverlayControllerContext.ts,useGuardedOverlayModeSwitch.ts}`                                                                                     | `capabilities/overlays/page-overlays`  | Planned       | Page-overlay orchestration and guarded mode changes.                                                                                   |
| `table/**`                                                                                                                                                                               | `capabilities/table`                   | Split         | Parent table foundations plus `responsive-table` and `management-table`.                                                               |
| `unsaved-changes/**`                                                                                                                                                                     | `capabilities/unsaved-changes`         | Planned       | Independent registry and discard workflow.                                                                                             |
| `video/**`                                                                                                                                                                               | Declared `./video` compatibility entry | Compatibility | Will map to the deferred OvenPlayer integration.                                                                                       |

## Component inventory

### Root component files

| Current path pattern                                                                                      | Target owner                                              | Disposition   | Notes                                                                        |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| `components/AppBottomDrawer.tsx`                                                                          | `capabilities/overlays/components/overlays`               | Planned       | Bottom-sheet overlay.                                                        |
| `components/{AppCardActions.tsx,AppCardContent.tsx,SlidingScreenStack.tsx,ResponsiveMonthYearPicker.tsx}` | `core/components`                                         | Split         | Classify individually as surfaces, layout, or inputs during Vireo migration. |
| `components/DelayedRender.tsx`                                                                            | `core/components/behavior/VireoDelayedRender`             | Compatibility | Thin deprecated alias.                                                       |
| `components/{FormToggleButtonField.tsx,MobileFormParts.tsx}`                                              | `capabilities/forms/components/forms`                     | Planned       | Coupled to form state or form composition.                                   |
| `components/ManagementSearchToolbar.tsx`                                                                  | `capabilities/table/management-table/components/controls` | Planned       | Management-table search workflow.                                            |
| `components/ResponsiveCard.tsx`                                                                           | `capabilities/page-layout/components/surfaces`            | Planned       | Behavior depends on page-content layout mode.                                |

### Data-display components

| Current path pattern                                                                                                                                                                                    | Target owner                                 | Disposition | Notes                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------- | -------------------------------------------------------------------------------------- |
| `components/data-display/{RgoClientTable,RgoServerTable,RgoTable}/**`                                                                                                                                   | `capabilities/table/components/data-display` | Planned     | Parent-owned table foundations.                                                        |
| `components/data-display/{RgoJsonViewerDialog,RgoSnackDetailsButton}/**`                                                                                                                                | `capabilities/overlays/components/overlays`  | Planned     | Compositions that open layered detail surfaces.                                        |
| `components/data-display/RgoVideoStreamPlayer/**`                                                                                                                                                       | Deferred OvenPlayer integration              | Deferred    | Misplaced integration component.                                                       |
| `components/data-display/{RgoIcon,RgoJsonViewer,RgoPdfFrame,RgoSnack,RgoStatusDot,RgoStatusText,RgoStopwatch,RgoTimeWithDateDisplay,RgoTimeWithDateDisplayInline,RgoTruncatedText,RgoValueWithUnit}/**` | `core/components`                            | Split       | Classify as data-display, feedback, or surfaces; keep thin Rgo aliases where required. |

### Feedback, input, layout, navigation, and utility components

| Current path pattern                                              | Target owner                                     | Disposition | Notes                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------ | ----------- | ----------------------------------------------------------- |
| `components/feedback/{RgoDialogHeader,RgoDrawer}/**`              | `capabilities/overlays/components/overlays`      | Planned     | Legacy category is incorrect.                               |
| `components/feedback/{RgoLoader,RgoQueryErrorLoaderSuspense}/**`  | `core/components/feedback`                       | Planned     | Generic loading, suspense, and error-boundary presentation. |
| `components/inputs/RgoForm/**`                                    | `capabilities/forms/components/forms`            | Planned     | Form workflow component.                                    |
| `components/inputs/{RgoButtonBase,RgoIconButton}/**`              | `core/components/controls`                       | Planned     | General action controls.                                    |
| `components/inputs/RgoInput*/**`                                  | `core/components/inputs`                         | Planned     | Controlled value-level inputs; excludes `RgoForm`.          |
| `components/layout/{RgoFormSection,RgoFormSectionGrid}/**`        | `capabilities/forms/components/forms`            | Planned     | Form-owned structure.                                       |
| `components/layout/RgoInfiniteCanvas/**`                          | `capabilities/infinite-canvas/components/layout` | Planned     | Canvas capability and its private pieces.                   |
| `components/layout/RgoPage*/**`                                   | `capabilities/page-layout/components/layout`     | Planned     | Page shell, body, and header.                               |
| `components/navigation/RgoTabs/**`                                | `core/components/navigation`                     | Planned     | Generic design-system navigation primitive.                 |
| `components/utility/RgoShowIf/**`                                 | `core/components/behavior`                       | Planned     | Replace the legacy `utility` category with `behavior`.      |
| `core/components/behavior/VireoDelayedRender/**`                  | `core/components/behavior`                       | Migrated    | First complete core component migration slice.              |
| `core/components/data-display/VireoLabelBox/**`                   | `core/components/data-display`                   | Migrated    | Canonical labelled-content anatomy.                         |
| `core/components/data-display/VireoTruncatedContent/**`           | `core/components/data-display`                   | Migrated    | Accessible disclosure for overflowing rich content.         |
| `core/components/surfaces/VireoIconContainer/**`                  | `core/components/surfaces`                       | Migrated    | Canonical icon-geometry normalization surface.              |
| `capabilities/overlays/components/overlays/VireoOverlayHeader/**` | `capabilities/overlays/components/overlays`      | Migrated    | Canonical overlay header anatomy.                           |

## Hook inventory

| Current path pattern                                                                                                                                                                      | Target owner                                             | Disposition | Notes                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------- | --------------------------------------------------------------- |
| `hooks/useAppPageContentLayout.ts`                                                                                                                                                        | `capabilities/page-layout/hooks/useAppPageContentLayout` | Planned     | Page-layout context consumer.                                   |
| `hooks/{useDelayedOverlayMount.ts,usePageOverlayModes.ts}`                                                                                                                                | `capabilities/overlays/page-overlays/hooks`              | Planned     | Page-overlay lifecycle and modes.                               |
| `hooks/useManagementTableState.ts`                                                                                                                                                        | `capabilities/table/management-table/hooks`              | Planned     | Management table state.                                         |
| `hooks/{useMediaQueryDevice.ts,useResponsiveProps.ts,useSingleFlightAction.ts}`                                                                                                           | `core/hooks`                                             | Planned     | Foundational generic hooks.                                     |
| `hooks/useRgoConfirm/**`                                                                                                                                                                  | `capabilities/overlays/confirmation/hooks`               | Planned     | Confirmation workflow.                                          |
| `hooks/{useRgoDependentFieldValidation,useRgoForm,useRgoMultiStepForm,useRgoTypedFieldArray,useRgoTypedForm}/**`                                                                          | `capabilities/forms/hooks`                               | Planned     | Form-state behavior; multi-step remains parent-owned initially. |
| `hooks/useRgoInfiniteCanvas/**`                                                                                                                                                           | `capabilities/infinite-canvas/hooks`                     | Planned     | Moves with the canvas capability.                               |
| `hooks/useRgoMutation/**`                                                                                                                                                                 | Deferred TanStack Query integration                      | Deferred    | Query mutation behavior is integration-bound.                   |
| `hooks/useRgoSseEmitter/**`                                                                                                                                                               | Deferred network/integration audit                       | Deferred    | Not part of the in-process event bus.                           |
| `hooks/{useRgoAutoDismiss,useRgoContainerSize,useRgoDebounce,useRgoDownloadFn,useRgoFadePresence,useRgoFullscreenListener,useRgoIcons,useRgoResizeListener,useRgoTabs,useRgoUrlState}/**` | `core/hooks`                                             | Planned     | Generic design-system or browser behavior.                      |

## Provider, service, and setup inventory

| Current path pattern                                                                                         | Target owner                                   | Disposition | Notes                                                                 |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ----------- | --------------------------------------------------------------------- |
| `providers/{AppMobileAttributeProvider.tsx,AppThemeColorMetaProvider.tsx,RgoProviders.tsx,RgoProviders.mdx}` | `core/providers`                               | Planned     | Foundational provider composition and document/theme behavior.        |
| `providers/AppSnackbarProvider.tsx`                                                                          | Deferred Sonner integration                    | Deferred    | Third-party notification delivery.                                    |
| `providers/RgoConfirmProvider/**`                                                                            | `capabilities/overlays/confirmation/providers` | Planned     | Confirmation workflow owner.                                          |
| `providers/createRgoFormDialogProvider/**`                                                                   | `capabilities/forms/form-overlays/providers`   | Planned     | Form-owned overlay composition.                                       |
| `providers/{RgoIconsProvider,RgoInitializeProvider,RgoThemeProvider}/**`                                     | `core/providers`                               | Planned     | Foundational icon, lifecycle, and theme providers.                    |
| `providers/RgoLocalizationProvider/**`                                                                       | Deferred i18next/dayjs/MUI integration         | Deferred    | Integration-owned initialization.                                     |
| `providers/RgoQueryClientProvider/**`                                                                        | Deferred TanStack Query integration            | Deferred    | Integration-owned provider.                                           |
| `services/**`                                                                                                | `core/services`                                | Planned     | Current local-storage service is foundational browser infrastructure. |
| `setup/config/RgoIconRegistry.ts`                                                                            | `core` icon system                             | Planned     | Eliminate `setup`; place the registry by meaning.                     |
| `setup/config/icons/**`                                                                                      | `core` icon system                             | Planned     | Built-in React icon components.                                       |
| `setup/config/RgoLocale.ts`                                                                                  | Deferred i18next integration                   | Deferred    | Locale contracts and mappings.                                        |
| `setup/config/hooks/**`                                                                                      | Deferred i18next integration                   | Deferred    | Translation behavior.                                                 |
| `setup/translations/**`                                                                                      | Deferred i18next integration                   | Deferred    | Translation resources.                                                |

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

| Completed on | Source                                                             | Destination                                                    | Notes                                                                            |
| ------------ | ------------------------------------------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 2026-08-19   | `src/docs/**`                                                      | `docs/storybook`                                               | Package-wide Storybook MDX now lives outside the production source tree.         |
| 2026-08-19   | `components/utility/VireoDelayedRender/**`                         | `core/components/behavior/VireoDelayedRender`                  | Component, tests, story, exports, and Vireo authoring utilities moved together.  |
| 2026-08-19   | `components/data-display/{RgoIconContainer,VireoIconContainer}/**` | `core/components/surfaces/VireoIconContainer`                  | Removed the duplicate Rgo implementation and preserved its package-root aliases. |
| 2026-08-19   | `components/data-display/{RgoLabelBox,VireoLabelBox}/**`           | `core/components/data-display/VireoLabelBox`                   | Removed deep legacy alias imports and preserved package-root aliases.            |
| 2026-08-19   | `components/data-display/VireoTruncatedContent/**`                 | `core/components/data-display/VireoTruncatedContent`           | Moved the complete Vireo module; retained distinct legacy `RgoTruncatedText`.    |
| 2026-08-19   | `overlay/VireoOverlayHeader/**`                                    | `capabilities/overlays/components/overlays/VireoOverlayHeader` | Established the overlays boundary and moved the complete Vireo module.           |

## Automated verification

`npm run test:architecture` now checks that:

1. expands inventory brace sets;
2. enumerates every file under `packages/ui/src`;
3. fails when a file matches zero rows;
4. fails when a file matches more than one row;
5. reports stale patterns that match nothing.

It also enforces the target source root, capability depth, structural folders, component categories, Vireo root contract, barrel placement, import boundaries, sibling isolation, and acyclic capability dependencies wherever target-architecture code exists.

Legacy source-location violations are recorded as exact file paths in `packages/ui/architecture.allowlist.json`. Adding another file beneath an existing legacy module therefore fails rather than silently expanding a broad directory exception. Inventory, target-structure, Vireo, and dependency violations cannot be allowlisted.
