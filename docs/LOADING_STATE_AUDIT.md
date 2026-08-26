# Loading-State and Skeleton Audit

**Phase:** 2 — repository audit  
**Status:** Baseline  
**Audited against:** [Vireo Loading-State and Skeleton Standard](LOADING_STATE_STANDARD.md)  
**Scope:** `@vireocodedev/starter-ui` public loading primitives and async-capable visual components

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

| Surface                                                  | Category                                 | Current treatment                                                                                                                                             | Geometry target                                     | Rating        | Priority | Owner                       |
| -------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------- | -------- | --------------------------- |
| `VireoDelayedRender`                                     | `boundary` helper                        | Defers mounting with a component-local 200 ms default. It owns timing only.                                                                                   | Not applicable                                      | Partial       | P0       | Core behavior               |
| `VireoQueryBoundary`                                     | `boundary`                               | Suspense fallback uses an accessible centered progress indicator; consumers may replace it. Error and retry behavior is local and recoverable.                | C by default; consumer-declared for custom fallback | Partial       | P1       | TanStack Query integration  |
| `VireoInitializationBoundary`                            | `boundary`                               | Replaces a gated subtree with a consumer fallback and throws initialization errors to an ancestor.                                                            | C by default; consumer-declared for fallback        | Partial       | P1       | Core behavior               |
| `VireoResponsiveTable`                                   | `skeleton-capable`, `content-preserving` | Keeps table headers and pagination, renders desktop skeleton rows, renders a separate mobile skeleton card tree, and preserves rows during next-page loading. | B; A for stable outer anchors                       | Non-compliant | P0       | Responsive table capability |
| Four autocomplete field variants                         | `content-preserving`                     | Retain the control and selected values while MUI presents loading text and a local progress adornment.                                                        | A control frame                                     | Partial       | P2       | Forms capability            |
| `VireoFormSubmitButton`                                  | `busy-action`                            | Tracks form submission, presents MUI loading feedback, and prevents duplicate submission through button loading/disabled behavior.                            | A                                                   | Partial       | P1       | Forms capability            |
| `VireoFormNextStepButton`                                | `busy-action`                            | Tracks asynchronous step transition, sets `aria-busy`, disables unsafe repetition, and retains the workflow.                                                  | A                                                   | Aligned       | P2       | Forms capability            |
| `VireoConfirmationDialog`                                | `busy-action`                            | Retains target context, disables closing and actions, and adds a progress indicator to the confirm action.                                                    | A                                                   | Partial       | P1       | Confirmation capability     |
| `VireoForm` and `VireoFormFileListField` lifecycle flags | `static` for loading classification      | Expose submitting/validating owner state for presentation and safety; they do not independently render a loading treatment.                                   | Not applicable                                      | Aligned       | P2       | Forms capability            |
| `VireoFormStepProgress`                                  | Not loading                              | Represents known multi-step completion rather than an asynchronous wait.                                                                                      | Not applicable                                      | Not loading   | —        | Forms capability            |

The autocomplete row covers `VireoFormAutocompleteField`, `VireoFormAutocompleteMultipleField`, `VireoFormFreeSoloAutocompleteField`, and `VireoFormFreeSoloAutocompleteMultipleField`.

## Detailed findings

### F-01 — semantic loading tokens are absent

**Rating:** Non-compliant  
**Priority:** P0

`VIREO_MOTION_TOKENS` supplies general interaction durations, but there is no loading-specific contract for the 150 ms reveal delay, 120 ms content transition, 1,400 ms calm pulse, skeleton colors, or skeleton radius. `VireoDelayedRender` defaults to 200 ms, while consuming code already uses separate 150 ms literals or unrelated motion tokens.

**Required remediation:** Add public semantic loading tokens and make public loading behavior consume them. Theme integration must provide the base/highlight colors and radius without forcing consumers to style raw MUI skeletons independently.

### F-02 — skeleton leaves have no shared primitive

**Rating:** Non-compliant  
**Priority:** P0

Production skeletons currently use raw MUI `Skeleton`. Animation style, duration, reduced-motion behavior, accessible hiding, and represented-leaf radius are therefore repeated or implicit.

**Required remediation:** Introduce a first-class skeleton leaf or an equivalent centralized theme contract. It must remain visual-only, be hidden from assistive technology, inherit semantic loading tokens, and disable nonessential animation under reduced motion.

### F-03 — responsive-table announcement ownership is duplicated

**Rating:** Non-compliant  
**Priority:** P0

The responsive-table root applies `aria-busy` during initial loading. The desktop layout applies it again. The mobile viewport applies it again, and the mobile skeleton card adds another busy state and label for the same operation.

**Required remediation:** Make the public table root the single announcing/busy boundary. Descendant skeleton leaves and layout implementations must be silent.

### F-04 — the mobile table skeleton independently reproduces row layout

**Rating:** Non-compliant  
**Priority:** P0

Desktop loading uses the real table, row, and cell elements. Mobile loading instead renders a separate card/box tree that imitates the accordion summary. That tree duplicates row height, spacing, sticky behavior, and adornment layout, violating the structural invariant.

**Required remediation:** Render mobile skeleton leaves through the same summary/frame structure as loaded mobile rows. Declare bounded dimensions for unknown title and metadata lengths and add compact/regular alignment coverage.

### F-05 — responsive-table state semantics are compressed into one boolean

**Rating:** Partial  
**Priority:** P1

The `skeleton` flag is suitable for initial loading, while `isFetchingNextPage` correctly preserves existing mobile rows. The component contract does not explicitly prohibit using `skeleton` for refresh, does not declare a geometry level, and has no shared refresh treatment for desktop consumers.

**Required remediation:** Document `skeleton` as initial/no-usable-content only, document incremental loading separately, and decide whether refresh remains application-owned or becomes an explicit table slot/state. Preserve the existing content-first behavior.

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

**Rating:** Non-compliant  
**Priority:** P0

Current unit and Storybook coverage proves important behavior, including delayed rendering, table loading/empty output, form action pending states, and query/initialization retries. It does not provide the full standard matrix. The responsive table has no `AlignmentContract`; public boundaries and busy actions do not consistently expose canonical `Loaded`, `Loading`, `Refreshing`, `Empty`, and `Error` stories where applicable.

**Required remediation:** Add canonical stories and browser-level contracts after each component is remediated. Tests must include responsive modes, density, reduced motion, themes, representative localization, announcements, recovery, and CLS/anchor limits appropriate to the declared geometry level.

## State-transition coverage baseline

| Transition                                    | Shared support today                                         | Gap                                                     |
| --------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| Initial loading → content                     | Query boundary, initialization boundary, responsive table    | Timing and geometry contracts are not unified.          |
| Initial loading → empty                       | Responsive table and consumer rendering                      | No canonical transition/alignment contract.             |
| Initial loading → error                       | Query boundary; consumer-owned initialization error boundary | Initialization ownership and geometry are not explicit. |
| Content → refresh → updated                   | Consumer-owned; table supports retained next-page rows       | General refresh contract is undocumented.               |
| Content → refresh error with retained content | Consumer-owned                                               | No reusable presentation contract.                      |
| Mutation → success/error                      | Form buttons and confirmation dialog preserve context        | Busy semantics and announcements are inconsistent.      |

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
- [ ] Findings remediated. This begins in the next implementation phase.
