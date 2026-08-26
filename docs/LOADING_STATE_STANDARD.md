# Vireo Loading-State and Skeleton Standard

**Version:** 1.0  
**Status:** Normative  
**Applies to:** Vireo Starter UI, Vireo Starter Template, and applications built from the template

## Purpose

This standard defines how Vireo visual surfaces represent asynchronous work. Its goals are to prevent avoidable layout shift, preserve context, provide consistent feedback, and make loading behavior accessible and testable.

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative requirements.

## Scope

This standard applies to every visual surface that owns or represents asynchronous state, including pages, overlays, forms, tables, lists, cards, widgets, and actions.

Atomic visual primitives that do not own asynchronous work do not require a skeleton API. They participate in the loading contract of the nearest owning surface.

This standard does not decide whether an individual route is eager or lazy. It defines the behavior required when a route or its content is pending.

## Terminology

- **Surface:** A visible region that presents related content or actions.
- **Boundary:** The surface that owns loading timing, accessibility announcements, and the transition between states.
- **Leaf:** A content value inside stable structure, such as text, an image, an icon, or a data cell.
- **Initial loading:** The surface has no usable content to present yet.
- **Refreshing:** The surface has usable content while newer content is requested.
- **Skeleton:** A non-interactive visual placeholder for unknown content inside known structure.
- **Static content:** Content known without the pending operation, such as a page title, form label, or table heading.
- **Dynamic content:** Content whose value or existence depends on the pending operation.
- **Stale content:** Previously valid content retained while a refresh is in progress.

## 1. Required loading classification

Every async-capable surface MUST declare one or more of the following behavior categories in its documentation, story, test fixture, or owning feature contract.

| Category             | Contract                                                                         |
| -------------------- | -------------------------------------------------------------------------------- |
| `static`             | The component does not own asynchronous state.                                   |
| `content-preserving` | Existing usable content remains visible while work continues.                    |
| `skeleton-capable`   | Initial loading replaces unknown leaves inside stable structure.                 |
| `busy-action`        | An interaction communicates pending work without replacing surrounding content.  |
| `boundary`           | The component coordinates timing, announcements, and child loading presentation. |

A surface MUST NOT gain a `loading` API merely because it is visual. Loading behavior belongs at the closest component that understands the asynchronous operation and the content it affects.

## 2. Loading taxonomy and standard treatment

| Situation                              | Default treatment                                          | Skeleton eligibility                                        |
| -------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| Application bootstrap or auth recovery | Branded application loader                                 | Only when application structure is already known and stable |
| Route JavaScript loading               | Route-declared policy: retain, progress, skeleton, or none | Only when the destination structure is synchronously known  |
| Initial data loading                   | Stable structure with unknown leaves skeletonized          | Yes                                                         |
| Component or widget initial loading    | Local loading state inside that component                  | Yes                                                         |
| Background refresh with usable content | Retain content and show subtle progress                    | No replacement skeleton                                     |
| Mutation such as save or delete        | Busy action and local feedback                             | No                                                          |
| Pagination with usable prior results   | Retain prior rows when safe and indicate progress          | Only for genuinely empty incoming slots                     |
| Unknown destination structure          | Progress indicator or retained previous content            | No invented skeleton                                        |

### Decision order

An owning boundary MUST choose its treatment in this order:

1. If usable content already exists, preserve it.
2. If only an action is pending, communicate busy state at that action.
3. If no usable content exists and the final structure is known, use a structure-preserving skeleton.
4. If the final structure is not known, use retained content or progress rather than inventing geometry.
5. If the operation normally completes before the reveal threshold, delay transient loading visuals.

## 3. Structural invariant

> A skeleton MAY replace content leaves, but it MUST NOT independently reproduce layout geometry.

Loaded and skeleton states MUST share the components that determine:

- Page and section frames
- Responsive containers and maximum widths
- Headers and action regions
- Grid and stack rules
- Cards, table structure, rows, and form structure
- Typography wrappers and line-height
- Padding, gaps, borders, and radii
- Scroll-container and pagination geometry

Independent skeleton trees that duplicate these measurements are non-compliant.

Skeleton leaves MAY replace:

- Unknown text or numeric values
- Remote images and media
- Data-controlled icons
- Unknown cells or record-specific metadata
- Sections whose existence is itself dynamic, provided their reserved geometry is documented

## 4. Static-content policy

Static content SHOULD remain visible during data loading. This includes:

- Page titles and descriptions
- Section headings
- Table column labels
- Form labels and helper instructions
- Navigation
- Known actions
- Explanatory copy that does not depend on the request

Static content MAY be visually skeletonized during route-code loading only when the route policy explicitly requires a cohesive page skeleton. Its accessible name and real geometry MUST remain available.

Dynamic content SHOULD be skeletonized only during initial loading. A refresh MUST NOT replace already usable dynamic content with skeletons.

## 5. State model

Every data-owning surface MUST define behavior for the applicable transitions:

```text
initial loading -> content
initial loading -> empty
initial loading -> error
content -> refreshing -> updated content
content -> refreshing -> refresh error with retained content
content -> mutation -> success or recoverable error
```

The standard state semantics are:

- **Initial loading:** No usable content exists. A skeleton is permitted when structure is known.
- **Content:** Current usable content is interactive.
- **Refreshing:** Existing content remains visible and normally interactive. A subtle progress signal MAY be shown.
- **Empty:** Stable structure communicates that no content exists and provides relevant next actions.
- **Error:** The affected boundary communicates failure and recovery without removing unrelated usable content.
- **Mutation:** The initiating action communicates pending state. Unaffected content remains visible.

## 6. Geometry guarantees

Every `skeleton-capable` surface MUST declare one geometry level.

### Level A — Exact

Use when structure, responsive behavior, and the geometry-reserving content are known.

Requirements:

- Loaded and loading states MUST share structural components.
- Major alignment anchors MUST differ by no more than 1 CSS pixel in browser tests.
- The loading-to-content transition SHOULD produce a cumulative layout shift of 0 and MUST remain at or below 0.01 in the tested scenario.
- Localized wrapping, supported page-width preferences, and responsive modes MUST be included in the contract.

### Level B — Bounded

Use when structure is known but record count, text length, media ratio, or similar data cannot be predicted exactly.

Requirements:

- Outer frame, controls, headings, and stable sections MUST remain fixed.
- Variable dimensions MUST use documented bounds such as line clamps, minimum heights, aspect ratios, or fixed row sizes.
- Any expected movement MUST be constrained to the owning surface and covered by a test.

### Level C — Estimated or progress-only

Use when the destination structure cannot be predicted reliably.

Requirements:

- The interface MUST NOT present an invented detailed skeleton as if it were exact.
- Retained content or a progress treatment SHOULD be preferred.
- Any estimate MUST be identified as such in the surface contract.

Level A is the default whenever the information needed to reserve geometry is locally available.

## 7. Boundary and leaf ownership

The loading boundary MUST own:

- Whether the state is initial loading, refreshing, mutation, empty, or error
- Reveal delay
- Accessible status and `aria-busy`
- Transition from loading to content
- Coordination of child placeholders

Skeleton leaves MUST own only their visual placeholder representation. They MUST NOT independently announce loading, start reveal timers, or decide whether stale content should be retained.

Nested boundaries MUST NOT produce duplicate announcements for the same operation. A descendant boundary covered by an announcing ancestor MUST remain silent unless it represents independently actionable work.

## 8. Timing and motion contract

Vireo implementations MUST use one shared semantic token set rather than component-local literal values. The token contract MUST include:

| Token role                  | Version 1 default                                             |
| --------------------------- | ------------------------------------------------------------- |
| Reveal delay                | 150 ms                                                        |
| Content transition duration | 120 ms                                                        |
| Skeleton animation          | Calm pulse                                                    |
| Skeleton animation duration | 1,400 ms                                                      |
| Base color                  | Theme semantic skeleton base                                  |
| Highlight color             | Theme semantic skeleton highlight                             |
| Radius                      | Inherit the represented leaf or use the theme skeleton radius |

Rules:

- A transient loading visual MUST NOT mount before the reveal delay unless immediate feedback is necessary for an explicit user action.
- An operation that completes before the reveal delay MUST NOT flash a skeleton.
- Content MUST NOT be artificially delayed to satisfy a minimum skeleton display duration.
- A boundary SHOULD use a short opacity transition when replacing skeleton leaves with content.
- Multiple independent skeleton animation styles MUST NOT appear in one surface.
- Under `prefers-reduced-motion: reduce`, skeleton animation and nonessential loading transitions MUST be disabled.
- Progress animation required to communicate ongoing indeterminate work MAY continue under reduced motion only in its least distracting supported form.

## 9. Accessibility contract

Every loading boundary MUST:

- Apply `aria-busy="true"` to the smallest stable region that is genuinely pending.
- Provide one useful loading status when the wait becomes visible or materially affects interaction.
- Use polite announcements unless immediate intervention is required.
- Preserve accessible names for known headings, labels, and actions.
- Preserve focus unless the focused element is intentionally removed by the completed operation.
- Disable an existing action only when executing it would be unsafe or invalid during the pending operation.

Every skeleton leaf MUST:

- Be non-interactive.
- Be hidden from the accessibility tree.
- Avoid creating empty semantic headings, labels, cells, or controls.

Loading completion MUST NOT produce a redundant announcement for every leaf. The boundary owns the announcement.

## 10. Component-specific requirements

### Pages and routes

- The application shell and stable page frame MUST remain consistent.
- Page-width preferences MUST constrain loaded and loading states identically.
- Each lazy route MUST declare one policy: `retain`, `progress`, `skeleton`, or `none`.
- A route skeleton MUST use a synchronously available shared page structure.
- Route policy selection is separate from the eager-versus-lazy decision.

### Tables and lists

- Static headers, filters, and pagination controls SHOULD remain visible.
- Skeleton rows MUST use the real row or item structure and active density preference.
- Existing rows SHOULD remain visible during refresh and pagination when safe.
- Placeholder count MUST be derived from the visible page size, viewport capacity, or a documented fixed estimate.
- Empty and error states MUST occupy the table or list content region without destabilizing surrounding controls.

### Forms

- Known labels, sections, and instructions SHOULD remain visible.
- A known form schema SHOULD render its real control structure rather than a generic form-shaped block.
- Unknown values MAY use leaf placeholders or disabled controls as appropriate.
- Submission uses busy-action behavior, not a form skeleton.

### Cards and widgets

- The real card or widget frame MUST be used.
- Known titles and actions SHOULD remain visible.
- Unknown values, media, and record-specific metadata MAY be skeletonized.
- A dashboard refresh MUST preserve existing cards and values whenever usable stale content exists.

### Overlays and drawers

- The overlay frame, title, close action, and focus-management contract MUST remain stable.
- Opening an overlay for unknown content MAY skeletonize its content region.
- Loading MUST NOT trap focus on decorative placeholders.

### Actions and mutations

- The initiating control MUST communicate busy state and prevent duplicate submission when required.
- Surrounding content MUST remain visible.
- Destructive operations MUST preserve enough context to understand the affected target until success is confirmed.

## 11. Required stories and tests

Every public `skeleton-capable`, `content-preserving`, `busy-action`, or `boundary` component MUST demonstrate the applicable states in live documentation.

Required canonical story names are:

- `Loaded`
- `Loading`
- `Refreshing`
- `Empty`
- `Error`
- `AlignmentContract`

Only applicable states are required; omissions MUST be intentional and documented.

Verification MUST cover, where applicable:

- Loading-to-loaded anchor geometry
- Compact and regular responsive modes
- Supported page-width preferences
- Default and longest supported localization
- Supported color schemes
- Reduced-motion behavior
- Accessibility violations and announcements
- Loading, empty, error, refresh, and recovery transitions
- Unexpected cumulative layout shift

An exact-geometry alignment contract MUST compare at least:

- Outer frame
- Primary heading
- First content anchor
- Repeated item or card boundaries
- Primary action region when present

## 12. Ownership across repositories

### Vireo Starter UI

Starter UI owns:

- Reusable skeleton leaves and accessible boundary primitives
- Semantic loading tokens and reduced-motion behavior
- Loading contracts for reusable visual components
- Public stories, tests, documentation, and migration notes

### Vireo Starter Template

Starter Template owns:

- Route-loading policy declarations
- Page-frame conventions
- Application-level loading composition
- Reference implementations for initial, refreshing, empty, and error states
- Integration and end-to-end verification

### Feature and application code

Feature code owns:

- Domain-specific loading shapes
- Identification of static and dynamic leaves
- Query and mutation state interpretation
- Feature-level empty, error, refresh, and recovery behavior

Reusable presentation MUST move downward to Starter UI only after the audit demonstrates a cross-application contract. Domain-specific page composition MUST remain in the application.

## 13. Exceptions

An exception to a **MUST** or **MUST NOT** requirement MUST document:

- The violated requirement
- Why compliance is currently impractical
- The affected surface and geometry level
- User-visible consequences
- The owner and a remediation issue or review condition

Undocumented exceptions are non-compliant.

## 14. Compliance checklist

An async-capable visual surface is compliant only when all applicable answers are yes:

- [ ] Its loading category or categories are declared.
- [ ] Its initial, content, refreshing, empty, error, and mutation states are defined as applicable.
- [ ] Existing usable content is retained during refresh.
- [ ] Skeleton leaves use the real structural components.
- [ ] Static and dynamic content are intentionally identified.
- [ ] Its geometry level is declared and tested.
- [ ] One boundary owns timing and announcements.
- [ ] Skeleton leaves are decorative and non-interactive.
- [ ] Known headings and labels retain accessible names.
- [ ] Reveal timing and reduced-motion behavior use shared tokens.
- [ ] Required stories and transition tests exist.
- [ ] Any exception is documented.

## 15. Adoption sequence

1. Audit current route and component loading behavior against this standard.
2. Identify the smallest shared primitives required by observed gaps.
3. Pilot the contracts on a data-driven workflow.
4. Refine the standard only when the pilot exposes a general rule.
5. Roll out one vertical surface at a time.
6. Add authoring and CI enforcement after the contracts stabilize.
