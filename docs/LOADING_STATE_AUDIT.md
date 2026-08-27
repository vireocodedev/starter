# Loading-State and Skeleton Audit

**Phase:** 7 — reusable-owner rollout support

**Status:** Foundation, responsive table, history entry, and async confirmation contracts remediated

**Audited against:** [Vireo Loading-State and Skeleton Standard](LOADING_STATE_STANDARD.md)  
**Scope:** `@vireocodedev/ui` public loading primitives and async-capable visual components

## Purpose

This document is the Phase 2 compliance baseline for Vireo Starter UI. It records the loading behavior that exists before remediation, assigns ownership and geometry expectations, and establishes the order in which gaps are addressed.

This is an audit, not a declaration that every listed behavior is compliant. A row remains open until its required documentation, stories, and tests exist.

## Rating and priority

| Rating        | Meaning                                                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Aligned       | The implementation follows the applicable standard in the audited path. Required broader verification may still be open.                  |
| Partial       | The basic treatment is appropriate, but one or more ownership, timing, geometry, accessibility, or verification requirements are missing. |
| Non-compliant | The implementation contradicts a `MUST` or `MUST NOT` requirement.                                                                        |
| Not loading   | The matched state is form, workflow, or progress metadata rather than user-facing asynchronous loading.                                   |

| Priority | Meaning                                                                                     |
| -------- | ------------------------------------------------------------------------------------------- |
| P0       | Shared foundation or a broadly consumed component; remediate before application migrations. |
| P1       | Public contract with a material user-facing or accessibility gap.                           |
| P2       | Documentation, consistency, or narrower verification work.                                  |

## Executive baseline

Starter UI already provides useful pieces: delayed fallback mounting, initialization and query boundaries, table loading/empty/incremental states, asynchronous autocomplete feedback, and busy form and confirmation actions. The primary problem is that these pieces predate a shared loading contract and therefore make timing, visual, accessibility, and geometry decisions independently.

The audit found four cross-cutting gaps:

1. No semantic loading token set implements the standard reveal delay, content transition, skeleton pulse, colors, or radius.
2. No public skeleton-leaf primitive centralizes hidden semantics and reduced-motion behavior.
3. Boundary announcement ownership is inconsistent; the responsive table announces the same pending operation at nested levels.
4. Existing stories demonstrate states, but do not consistently use the canonical state names or verify geometry, reduced motion, localization, themes, and state transitions.

## Public surface inventory

| Surface                                                  | Category                                 | Current treatment                                                                                                                                                | Geometry target                                     | Rating      | Priority | Owner                       |
| -------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------- | -------- | --------------------------- |
| `VireoDelayedRender`                                     | `boundary` helper                        | Defers mounting with the shared semantic 150 ms reveal token. It owns timing only.                                                                               | Not applicable                                      | Aligned     | —        | Core behavior               |
| `VireoQueryBoundary`                                     | `boundary`                               | Suspense fallback uses an accessible centered progress indicator; consumers may replace it. Error and retry behavior is local and recoverable.                   | C by default; consumer-declared for custom fallback | Partial     | P1       | TanStack Query integration  |
| `VireoInitializationBoundary`                            | `boundary`                               | Replaces a gated subtree with a consumer fallback and throws initialization errors to an ancestor.                                                               | C by default; consumer-declared for fallback        | Partial     | P1       | Core behavior               |
| `VireoResponsiveTable`                                   | `skeleton-capable`, `content-preserving` | Keeps stable controls, delays silent skeleton leaves through one boundary, reuses real row anatomy in both layouts, and preserves rows during next-page loading. | B; A for stable outer anchors                       | Aligned     | —        | Responsive table capability |
| `VireoHistoryEntry`                                      | `skeleton-capable`                       | Exposes loaded and loading modes through one entry anatomy; the parent boundary owns reveal timing and announcements.                                            | B; A for stable entry anchors                       | Aligned     | —        | History capability          |
| Four autocomplete field variants                         | `content-preserving`                     | Retain the control and selected values while MUI presents loading text and a local progress adornment.                                                           | A control frame                                     | Partial     | P2       | Forms capability            |
| `VireoFormSubmitButton`                                  | `busy-action`                            | Tracks form submission, presents MUI loading feedback, and prevents duplicate submission through button loading/disabled behavior.                               | A                                                   | Partial     | P1       | Forms capability            |
| `VireoFormNextStepButton`                                | `busy-action`                            | Tracks asynchronous step transition, sets `aria-busy`, disables unsafe repetition, and retains the workflow.                                                     | A                                                   | Aligned     | P2       | Forms capability            |
| `VireoConfirmationDialog`                                | `busy-action`                            | Retains target context, awaits an optional async confirmation action, disables unsafe exits, and restores retry/cancel after rejection.                          | A                                                   | Partial     | P1       | Confirmation capability     |
| `VireoForm` and `VireoFormFileListField` lifecycle flags | `static` for loading classification      | Expose submitting/validating owner state for presentation and safety; they do not independently render a loading treatment.                                      | Not applicable                                      | Aligned     | P2       | Forms capability            |
| `VireoFormStepProgress`                                  | Not loading                              | Represents known multi-step completion rather than an asynchronous wait.                                                                                         | Not applicable                                      | Not loading | —        | Forms capability            |

The autocomplete row covers `VireoFormAutocompleteField`, `VireoFormAutocompleteMultipleField`, `VireoFormFreeSoloAutocompleteField`, and `VireoFormFreeSoloAutocompleteMultipleField`.

## Detailed findings

### F-01 — semantic loading tokens

**Rating:** Aligned

**Priority:** Remediated in Phase 3

`VIREO_LOADING_TOKENS` now owns reveal, content-transition, and skeleton-animation timing. `VireoDelayedRender`, `VireoLoadingRegion`, and `VireoSkeleton` consume that contract, while skeleton colors and radius resolve through the active MUI theme.

**Remediation record:** Public semantic tokens and theme-resolved visual values now replace component-local loading literals.

### F-02 — shared skeleton leaves

**Rating:** Aligned

**Priority:** Remediated in Phase 3

`VireoSkeleton` centralizes silent semantics, calm shared animation timing, reduced-motion behavior, shapes, and geometry-preserving child wrapping.

**Remediation record:** The public leaf contract and focused accessibility, theme, shape, and reduced-motion behavior now live in one component.

### F-03 — responsive-table announcement ownership

**Rating:** Aligned

**Priority:** Remediated in Phase 3

`VireoResponsiveTable` delegates initial-loading timing, `aria-busy`, and its one polite announcement to a single `VireoLoadingRegion`. Desktop and mobile descendants are silent.

**Remediation record:** Focused desktop and mobile tests assert exactly one busy boundary and one delayed status.

### F-04 — mobile table skeleton row anatomy

**Rating:** Aligned

**Priority:** Remediated in Phase 3

Desktop skeleton leaves render inside real table rows and cells. Mobile skeleton leaves render inside the same shared accordion and summary anatomy, including the same summary sizing and adornment layout. Placeholder widths are deterministic and bounded.

**Remediation record:** Both responsive modes use real repeated-item anatomy and are exercised by the public `AlignmentContract` story.

### F-05 — responsive-table state semantics are compressed into one boolean

**Rating:** Aligned

**Priority:** Remediated in Phase 3

The public contract documents `skeleton` as initial/no-usable-content only and keeps incremental mobile pagination content-preserving. General refresh remains application-owned so usable `data` stays visible rather than being replaced by skeletons. Geometry is Level B with Level A stable outer anchors.

**Remediation record:** Initial loading and incremental pagination are explicit; retained-content refresh feedback remains application-owned.

### F-06 — query and initialization boundaries lack standard timing contracts

**Rating:** Partial

**Priority:** P1

`VireoQueryBoundary` mounts its default progress fallback immediately and invents a generic minimum-height region. `VireoInitializationBoundary` delegates all fallback semantics to consumers and defaults to no feedback. Neither exposes a documented semantic reveal policy. The query boundary has strong single-region status semantics; the initialization boundary has none by default.

**Required remediation:** Define which boundary owns reveal delay and announcements, keep custom fallback ownership unambiguous, and document default geometry as Level C. Do not turn unknown child structure into a detailed skeleton.

### F-07 — busy-action semantics are inconsistent

**Rating:** Partial

**Priority:** P1

`VireoFormNextStepButton` explicitly applies `aria-busy`; `VireoFormSubmitButton` relies on MUI loading behavior without the same explicit contract. `VireoConfirmationDialog` preserves context and blocks unsafe exits, but neither the dialog region nor confirm action has an explicit busy announcement contract.

**Required remediation:** Choose one accessible busy-action contract for public actions, document when `aria-busy` belongs on the action versus its region, and apply it consistently without duplicate announcements.

### F-08 — autocomplete loading needs a declared local-state contract

**Rating:** Partial  
**Priority:** P2

The autocomplete variants correctly retain the field frame, input, and selected value while remote options load. Their documentation and test coverage do not yet declare them `content-preserving`, define loading-error behavior, or verify announcements and reduced motion.

**Required remediation:** Document the local widget contract once for all variants and add representative loading, retained-value, error/recovery, and accessibility coverage.

### F-09 — canonical state and geometry verification is incomplete

**Rating:** Partial

**Priority:** P0

The responsive-table pilot now covers delayed loading, single-boundary announcements, desktop/mobile anatomy, and an `AlignmentContract` story. The remaining public boundaries and busy actions do not yet consistently expose the full applicable canonical matrix.

**Required remediation:** Add canonical stories and browser-level contracts after each component is remediated. Tests must include responsive modes, density, reduced motion, themes, representative localization, announcements, recovery, and CLS/anchor limits appropriate to the declared geometry level.

### F-10 — history entries need shared loaded/loading anatomy

**Rating:** Aligned

**Priority:** Remediated in Phase 7

`VireoHistoryEntry` now exposes a discriminated loading mode that reuses the real entry frame, header, expanded body, column headings, and field-row anatomy. Unknown leaves use `VireoSkeleton`; the entry starts no timer and emits no independent status.

**Remediation record:** Focused tests cover the loading contract, public stories use `Loaded`, `Loading`, and `AlignmentContract`, and the consuming overlay supplies one enclosing `VireoLoadingRegion`.

## State-transition coverage baseline

| Transition                                    | Shared support today                                         | Gap                                                                                           |
| --------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Initial loading → content                     | Query boundary, initialization boundary, responsive table    | Timing and geometry contracts are not unified.                                                |
| Initial loading → empty                       | Responsive table and consumer rendering                      | No canonical transition/alignment contract.                                                   |
| Initial loading → error                       | Query boundary; consumer-owned initialization error boundary | Initialization ownership and geometry are not explicit.                                       |
| Content → refresh → updated                   | Consumer-owned; table supports retained next-page rows       | General refresh contract is undocumented.                                                     |
| Content → refresh error with retained content | Consumer-owned                                               | No reusable presentation contract.                                                            |
| Mutation → success/error                      | Form buttons and confirmation dialog preserve context        | Async confirmation execution and recovery are covered; shared busy announcements remain open. |

## Remediation order

1. **Foundation:** add semantic loading tokens, reduced-motion behavior, and the visual-only skeleton leaf contract.
2. **Pilot public surface:** remediate `VireoResponsiveTable`, including shared mobile row anatomy, single-boundary accessibility, density-aware placeholders, and alignment tests.
3. **Boundary contracts:** align `VireoDelayedRender`, `VireoQueryBoundary`, and `VireoInitializationBoundary` around timing and announcement ownership.
4. **Busy actions and widgets:** align submit, next-step, confirmation, and autocomplete contracts.
5. **Verification sweep:** canonicalize stories and complete the cross-theme, localization, responsive, reduced-motion, recovery, and geometry matrix.

## Phase 2 exit record

- [x] Public loading primitives inventoried.
- [x] Async-capable public visual components classified.
- [x] Existing initial, refresh, empty, error, pagination, and mutation treatments recorded.
- [x] Geometry targets assigned.
- [x] Accessibility and announcement ownership gaps recorded.
- [x] Remediation priorities and repository owners assigned.
- [x] Phase 3 foundation and responsive-table pilot findings remediated.
- [x] Phase 7 history-entry anatomy and async-confirmation execution contracts delivered for application rollout.
- [ ] Remaining boundary, action, widget, and cross-surface verification findings remediated in later phases.
