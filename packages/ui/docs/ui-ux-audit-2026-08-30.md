# Vireo UI/UX system audit — 2026-08-30

## Executive assessment

Vireo has an unusually strong component-authoring architecture: all 70 first-class components satisfy the canonical eight-file contract, the architecture ledger covers 1,058 files with no legacy exceptions, and the unit/type baselines are green. The system is structurally disciplined, but it is not yet at a premium reusable-product quality bar because visual foundations remain Storybook-private, accessibility debt is explicitly waived in stable stories, and alternate visual-mode coverage reaches only a small representative subset.

The highest-leverage work is therefore systemic rather than cosmetic: establish a canonical consumer theme, close accessible-name and label/control relationships, make browser quality gates representative, and prevent public APIs from exposing components that are invalid outside their owning facade.

## Evidence baseline

- Architecture: passing; 1,058 inventoried files and zero allowlist exceptions.
- First-class components: 70/70 have the canonical eight root files.
- TypeScript: package typecheck passing.
- Unit tests: 113 files and 755 tests passing before this audit's fixes.
- Browser stories, desktop dark: 79 files and 319 stories passing; one story fails because the current in-progress read-only forms change now renders a value where its play function still expects an interactive group.
- Browser alternate modes: mobile dark, desktop light, and reduced motion each pass the currently selected 3 files and 8 stories.
- Accessibility: 45 known Storybook axe findings are downgraded to `todo`.
- Public surface: the release-facing surface snapshot currently reports dependency drift and needs intentional reconciliation.

The worktree already contained a broad forms/read-only change. The audit treated that work as pre-existing, did not rewrite it, and separated its stale Storybook assertion from newly introduced changes.

## Remediation status

### Fixed in this audit

1. `createDarkTheme` now preserves consumer spacing, breakpoints, shadows, z-index, direction, secondary palette, custom theme extensions, and CSS-variable configuration while regenerating dark-mode variable channels.
2. Confirmation dialogs and responsive form overlays now connect their visible heading IDs to the rendered dialog, drawer, bottom-sheet, or docked-panel surface.
3. `VireoBottomDrawer` now forwards standard accessible-name attributes to its actual modal paper rather than leaving them on a non-dialog wrapper.

### Critical next work

1. **Make responsive overlay naming misuse-resistant.** The raw frame now forwards `aria-label` and `aria-labelledby` correctly, but its public type should eventually require one accessible-name strategy. Coordinate that breaking pre-1.0 API change with all consumers.
2. **Replace visual-only labelling with a control-association contract.** `VireoLabelBox` does not programmatically connect its label or helper text to a child control. The mobile responsive-table sort select is a verified unnamed control.
3. **Publish a canonical Vireo consumer theme.** The recognizable palette, type family, and radius currently live only in the Storybook provider. Consumers following installation documentation receive ordinary MUI defaults rather than a coherent Vireo product language.

## Prioritized findings

### P1 — Visual foundations

- The normal Storybook theme toolbar is misleading: preview state exposes light/dark selection, but the published provider used by normal Storybook is hard-coded dark. Only the test alias responds to the mode context.
- Mobile, light, and reduced-motion browser projects select only `vireo-matrix` stories. Only 3 of 80 UI story modules carry that tag, leaving most surfaces, overlays, forms, loaders, and typography untested outside desktop dark.
- Motion tokens are well designed but inconsistently consumed. Sliding screens use MUI defaults, application-navigation width transitions lack a reduced-motion branch, and full-screen overlays always use `Slide`.
- Typography, spacing, and shape are not consistently theme-driven. `VireoLabeledIconButton`, `VireoLabelBox`, and `VireoActionPreviewButton` contain notable fixed visual values that resist consumer density and typography changes.
- Numeric palette shades are used as if their meaning were semantic even though dark-theme derivation reverses some scales. Component-facing surface, border, handle, and interaction roles should be semantic tokens.
- The theming guide contains a copy-paste-broken table override: it uses a CSS variable without enabling CSS variables and targets a fixed numeric grey instead of a mode-aware surface role.

### P1 — Accessibility and interaction

- Desktop application navigation has no default navigation landmark and destination items default to buttons, losing native link behavior.
- Infinite Canvas cancels every wheel event and applies `touch-action: none`, trapping normal page scrolling and touch gestures by default. It also lacks a complete keyboard interaction contract.
- Storybook preserves exactly 45 accessibility exemptions instead of enforcing a reduction-only debt ratchet with ownership and expiry.
- `VireoTruncatedContent` exposes an undersized disclosure target, while the side-panel resize hitbox is only 14px wide.
- Desktop and mobile responsive-table status announcements differ; incremental mobile loading has an unnamed spinner and no consistent completion announcement.
- Event composition is inconsistent in Tabs, Infinite Canvas, and Confirmation Dialog. Some slot handlers are overwritten instead of running first with `defaultPrevented` cancellation.
- Clipboard failure in `VireoJsonViewer` is silent, and success is communicated only through a button-label change rather than a stable live status.

### P1 — Public API and release integrity

- Two TanStack-bound free-solo fields are star-exported as directly renderable components even though they throw outside the form facade. Their capability boundary should expose classes and types only, matching sibling fields.
- The public-surface gate reports dependency drift, including changed optional/subpath requirements. Review and version those changes intentionally rather than blindly updating the snapshot.

### P2 — Documentation and contract completeness

- Ten component stories lack `autodocs`; ten lack the exact `### Why it exists` section. The current story contract tests do not enforce the documented authoring standard.
- Component-level customization coverage is uneven: several components have no explicit root-ref, slot, or theme-integration proof despite exposing those contracts.
- Two DnD components move public prop/slot/ref orchestration into private render-prop roots. Either restore the canonical module boundary or document and enforce a narrow integration exception.
- Page-layout measurement initializes from viewport width before correcting to container width. Embedded layouts can initially choose the wrong mode, and SSR/hydration behavior lacks direct coverage.
- Migration documentation contains stale compatibility claims, including a side-panel resize alias no longer present in the public API.

## Quality program

### Phase 1 — Accessibility blockers

- Complete accessible naming for every modal and adjacent surface.
- Design and migrate the label/control association contract.
- Repair navigation landmarks and link semantics.
- Stop Infinite Canvas from capturing ordinary scroll/touch input by default.
- Convert Storybook accessibility debt to a reduction-only ratchet.

### Phase 2 — Product-level visual foundation

- Add `createVireoTheme` or equivalent canonical base options.
- Define semantic surface, border, text, focus, elevation, density, radius, and interaction tokens for light and dark schemes.
- Map MUI transitions to Vireo motion policy and centralize reduced-motion behavior.
- Make normal Storybook and browser contracts consume the same theme implementation.

### Phase 3 — Representative visual verification

- Expand the matrix by archetype: controls, data display, forms, overlays, navigation, feedback, layouts, and integrations.
- Cover desktop/mobile, light/dark, reduced motion, RTL, forced colors, 200% zoom, and orientation changes.
- Add image-based regression baselines for high-value compositions rather than every prop permutation.

### Phase 4 — API and documentation hardening

- Close facade-only runtime leaks and reconcile the public-surface snapshot.
- Add reusable contract harnesses for refs, slots, classes, theme defaults, and overrides.
- Enforce story metadata, rationale, and executable-source standards.
- Validate representative components with keyboard plus VoiceOver/NVDA, not axe alone.

## Patterns to preserve

- `VireoTabs` has strong tab/panel relationships and hidden-state semantics.
- `VireoLoadingRegion` owns delayed polite announcements and stable busy state.
- `VireoQueryBoundary` uses correct alert and labelled error-dialog patterns.
- Mobile bottom navigation combines a named landmark, `aria-current`, safe-area handling, generous targets, and reduced-motion CSS.
- Side-panel resize handles provide keyboard separator semantics with min/max/current values and Home/End/arrow behavior.
- Status dots and country flags distinguish decorative from labelled use.
- Container measurement already uses `ResizeObserver`, animation-frame batching, cleanup, and hysteresis; it needs deterministic initial/hydration behavior rather than a rewrite of the core primitive.
