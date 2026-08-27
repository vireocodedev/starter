# Vireo: Master Roadmap to a Thousands-of-Stars Open-Source Framework

> A comprehensive, implementation-grade roadmap for turning Vireo from a sophisticated internal platform and template into a trusted, desirable, sustainable open-source framework for production React + Spring Boot PWAs.

**Document status:** Living master roadmap

**Baseline reviewed:** 26 August 2026 archive containing `starter/` and
`starter-template/`

**Planning horizon:** Multiple months; likely longer for one maintainer

**Primary outcome:** Create a framework developers can discover, understand, try,
trust, adopt, upgrade, extend, recommend, and contribute to
**North-star positioning:** **The opinionated full-stack framework for polished, offline-capable business PWAs built with React and Spring Boot.**

---

## 1. Purpose and definition of success

This document is intentionally larger than an implementation backlog. Thousands of GitHub stars cannot be engineered directly: stars are a lagging signal produced by a useful product, excellent presentation, low-friction adoption, public proof, distribution, community trust, and sustained maintenance. The roadmap therefore covers the entire system around the code, not only the code.

The roadmap succeeds when Vireo has all of the following:

- A sharply defined audience and problem that can be understood in one sentence.
- A five-minute, credential-free path from discovery to a running full-stack app.
- A compelling vertical-slice workflow that saves days of work, not minutes.
- Production-grade frontend, backend, PWA, offline, security, testing, and deployment foundations.
- Public, verifiable, stable packages with predictable upgrades.
- Documentation that supports evaluation, first use, production adoption, troubleshooting, extension, and contribution.
- A visually exceptional demo that proves the framework's claims.
- Evidence from real applications and external adopters.
- Healthy issue, release, security, governance, and support processes.
- A repeatable launch and growth engine that reaches the right developers without overpromising.
- A sustainable scope that one maintainer or a small team can operate.

### 1.1 Success metrics

Track outcomes by funnel stage. Never optimize stars in isolation.

| Stage          | Metric                                          |          Initial target |                   Mature target |
| -------------- | ----------------------------------------------- | ----------------------: | ------------------------------: |
| Discovery      | README visitors who open docs/demo              |      Establish baseline | Increasing quarter over quarter |
| Interest       | GitHub stars                                    |                     100 |                          1,000+ |
| Evaluation     | Demo sessions and create-command starts         |      Establish baseline |       Consistent organic growth |
| Activation     | Users reaching a running app                    | >70% of measured starts |                            >85% |
| First value    | Users generating and using one vertical slice   | >50% of activated users |                            >70% |
| Adoption       | Independent production projects                 |                       3 |                             25+ |
| Retention      | Projects upgrading across a minor release       |                    >50% |                            >75% |
| Reliability    | Successful clean-install verification           |              100% in CI |    100% across supported matrix |
| Community      | Median first maintainer response                |                 <5 days |                         <3 days |
| Community      | External contributors per quarter               |                       1 |                              5+ |
| Quality        | Confirmed regressions escaping a stable release |          Downward trend |                            Rare |
| Security       | Critical vulnerabilities with an available fix  |                       0 |                               0 |
| Sustainability | Maintainer time spent on repetitive support     |                Measured |    Reduced through docs/tooling |

### 1.2 Non-goals

Vireo should explicitly avoid becoming:

- A general replacement for React, Spring Boot, MUI, TanStack Query, or Vite.
- A framework supporting every frontend framework, backend language, database, UI kit, or deployment provider.
- A low-code platform that hides normal React and Spring Boot development.
- A generic website or marketing-site framework.
- A universal microservices platform.
- A component library competing on raw component count.
- An abstraction layer that prevents users from accessing underlying libraries.
- A promise of fully offline behavior for arbitrary business logic without application-owned conflict decisions.
- A project whose roadmap is dictated solely by feature requests or star growth.

---

## 2. Current baseline and strategic interpretation

The reviewed baseline already contains substantial framework-grade foundations:

- Seven independently versioned frontend packages: UI, shell, infrastructure, localization, SQLite, query engine, and history.
- Spring Boot modules for core behavior, authentication, query engine, offline workflows, and history, coordinated through a BOM.
- Auto-configuration, consumer tests, publication tests, API-surface checks, architecture checks, release smoke tests, Storybook, generators, and documentation examples.
- A production-shaped template using React, TypeScript, MUI, TanStack Query, TanStack Form, Zod, Vite PWA, Spring Boot, Flyway, JPA, Spring Security, H2, and PostgreSQL.
- Application conventions for composition, features, pages, trust-boundary parsing, localization ownership, public entry points, loading states, responsive behavior, and reusable-library boundaries.
- Published-package and local-source development modes.
- Demonstrations of authentication, CRUD, history, filtering, offline concepts, real-time updates, responsive UI, forms, and browser capabilities.

This means the main challenge is not proving technical ambition. The next challenge is converting depth into a simple product experience.

### 2.1 Mandatory baseline audit before roadmap execution

- [ ] Inventory every public TypeScript export and JVM public type.
- [ ] Map every `starter-template` responsibility to one category: framework-required composition, replaceable adapter, product example, dev tool, or reusable candidate.
- [ ] Record current clean-install time, build time, test time, artifact sizes, browser bundle sizes, Lighthouse results, accessibility results, and container startup time.
- [ ] Run a clean-room onboarding exercise on Ubuntu, macOS, and Windows/WSL.
- [ ] Record every credential, environment variable, port, external service, and tool prerequisite.
- [ ] Identify all behavior documented but not contract-tested.
- [ ] Identify all behavior contract-tested but not documented.
- [ ] Identify all manual frontend/backend contract duplication.
- [ ] Identify all generated or build output currently tracked or accidentally archived.
- [ ] Create an architectural decision record for why frontend and JVM libraries share one repository but separate build graphs.
- [ ] Create a gap matrix against JHipster, Hilla, Refine, React-admin, and a manual Spring Boot + React stack.
- [ ] Interview at least five target developers who did not build Vireo.

**Exit gate:** A dated baseline report exists, with reproducible commands and a prioritized gap register. No major roadmap estimate is treated as reliable before this gate.

---

## 3. Product strategy and positioning

### 3.1 Define the ideal user

- [ ] Select a primary persona: full-stack developer or small team building operational business software.
- [ ] Define secondary personas: Java-heavy team needing a polished frontend; agency shipping repeated business apps; field-work team needing intermittent-connectivity support.
- [ ] Document excluded personas and why Vireo is a poor fit for them.
- [ ] Define the expected skill floor in Java, Spring Boot, React, TypeScript, SQL, and web fundamentals.
- [ ] Define the expected project types: inventory, accounting, warehouse, field service, manufacturing, CRM, workflow, administration, and operations.
- [ ] Define expected scale boundaries for users, records, concurrency, database size, offline queues, and deployment topology.

### 3.2 Validate the problem

- [ ] Conduct structured interviews with 10–20 target developers.
- [ ] Ask what they currently assemble, copy, repeatedly debug, and regret maintaining.
- [ ] Validate whether offline capability is a purchase/adoption driver or merely an impressive feature.
- [ ] Validate whether the strongest wedge is offline, production readiness, vertical-slice generation, cohesive UX, or the complete React/Spring contract.
- [ ] Test three landing-page messages with real developers.
- [ ] Record objections verbatim and map each objection to product, documentation, proof, or positioning work.

### 3.3 Establish the message hierarchy

- [ ] Finalize a one-sentence category statement.
- [ ] Finalize a one-paragraph explanation containing audience, problem, approach, and outcome.
- [ ] Define the top three claims only.
- [ ] For every claim, provide visible evidence, a runnable example, a benchmark, or a contract test.
- [ ] Avoid presenting the package/module count as value.
- [ ] Avoid leading with architecture terminology.
- [ ] Explain “opinionated” as a benefit and list the decisions Vireo makes.
- [ ] Explain escape hatches clearly.
- [ ] Establish terminology for Vireo framework, Vireo CLI, Vireo Starter packages, Vireo template, and Vireo examples.

### 3.4 Product principles

- [ ] Write and publish principles such as cohesive over infinitely customizable, explicit over magical, local-first development, production-shaped defaults, accessible by default, mobile intentionally designed, contracts over conventions alone, and escape hatches over lock-in.
- [ ] Require new features to state which product principle they advance.
- [ ] Reject features whose primary justification is matching a competitor checklist.

**Exit gate:** Five unfamiliar target developers can describe Vireo accurately after viewing the homepage for sixty seconds, and at least three express a concrete desire to try it.

---

## 4. Naming, brand, identity, and discoverability

- [ ] Perform trademark, package-name, domain, organization-name, and search-engine collision checks for “Vireo.”
- [ ] Confirm ownership or availability of the primary domain and relevant social handles.
- [ ] Decide whether package coordinates retain `@vireocodedev` / `com.vireocode` or migrate to a clearer public identity.
- [ ] Design a recognizable logo that works at favicon, repository-social-preview, CLI, and presentation sizes.
- [ ] Define accessible brand colors with light/dark variants and contrast guarantees.
- [ ] Define a short tagline and consistent repository descriptions.
- [ ] Produce GitHub social preview artwork.
- [ ] Produce reusable diagrams and screenshot templates.
- [ ] Create a brand usage guide so community materials remain recognizable.
- [ ] Create a pronunciation note if ambiguity appears in user testing.
- [ ] Configure repository topics for React, Spring Boot, PWA, offline-first, TypeScript, Java, MUI, business applications, and full-stack development.
- [ ] Build an SEO vocabulary around actual developer searches without keyword stuffing.

**Exit gate:** Search results, package pages, docs, demo, repository, CLI, and social cards present one coherent identity.

---

## 5. Repository and project topology

### 5.1 Decide repository strategy

- [ ] Decide whether `starter` becomes the canonical `vireo` repository.
- [ ] Decide whether the template remains separate, becomes a generated fixture, or lives in a coordinated repository.
- [ ] Decide where the CLI, website, examples, benchmarks, and compatibility fixtures live.
- [ ] Optimize for contributor comprehension and release independence.
- [ ] Document why each repository exists and who owns its releases.
- [ ] Establish cross-repository issue and release linking.

### 5.2 Repository hygiene

- [ ] Remove tracked build outputs unless deliberately published as documentation artifacts.
- [ ] Ensure `bin`, `dist`, `build`, `target`, `.gradle`, `.turbo`, `storybook-static`, coverage, test results, logs, IDE state, environment files, local databases, and generated secrets are ignored appropriately.
- [ ] Add deterministic line endings and editor settings.
- [ ] Add `.gitattributes`, `.editorconfig`, and explicit generated-file markers.
- [ ] Validate archives and source distributions automatically.
- [ ] Add secret scanning and prevent known secret formats from entering history.
- [ ] Keep the root navigation comprehensible through a repository map.
- [ ] Make generated code visibly distinguishable from owned code.

### 5.3 Architecture governance

- [ ] Maintain dependency graphs for frontend and JVM modules.
- [ ] Add cycle detection and forbidden-dependency enforcement.
- [ ] Define package admission, split, merge, and retirement criteria.
- [ ] Define which APIs may depend on React, browser globals, MUI, Spring, JPA, servlet APIs, or database-specific behavior.
- [ ] Maintain architecture decision records for consequential decisions.
- [ ] Add an architecture fitness test for every normative dependency rule.
- [ ] Prevent test and Storybook conveniences from leaking into production exports.
- [ ] Enforce public entry points and ban private cross-package imports.

**Exit gate:** A new contributor can explain the repository topology and dependency rules without reading implementation internals.

---

## 6. Framework contract and extension model

### 6.1 Define the framework kernel

- [ ] Document the minimum runtime contract shared by all Vireo applications.
- [ ] Separate mandatory kernel behavior from optional capabilities.
- [ ] Define application startup, initialization, readiness, authentication recovery, routing, offline hydration, update, and shutdown lifecycles.
- [ ] Define deterministic provider ordering and extension hooks.
- [ ] Define failure semantics for each lifecycle phase.
- [ ] Make lifecycle state observable for debugging and testing.
- [ ] Prevent application code from relying on undocumented initialization order.

### 6.2 Capability model

- [ ] Define a capability descriptor covering routes, navigation, permissions, localization, API adapters, offline entities, history entities, query metadata, settings, stories, and tests.
- [ ] Determine which capability metadata can drive frontend and backend generation.
- [ ] Support capability enablement and removal without orphaned configuration.
- [ ] Add optional capability packages only when they have independent value and lifecycle.
- [ ] Provide official extension points for application-specific authentication, authorization, error reporting, analytics, storage, synchronization, and theming.
- [ ] Define compatibility rules for third-party extension packages.

### 6.3 Escape hatches

- [ ] Allow normal React routes and components alongside Vireo-managed pages.
- [ ] Allow normal Spring MVC controllers and services alongside Vireo modules.
- [ ] Allow custom data fetching where query abstractions are insufficient.
- [ ] Allow custom MUI composition without forking the theme.
- [ ] Allow an entity to opt out of offline, history, query filtering, or generation.
- [ ] Document how to replace each major adapter.
- [ ] Test that applications can eject generated code into ordinary application-owned code.

**Exit gate:** Framework-owned behavior and application-owned behavior have explicit, tested boundaries with documented replacement paths.

---

## 7. CLI and project creation experience

### 7.1 Create command

- [ ] Provide a canonical command such as `pnpm create vireo-app` or `npx create-vireo-app`.
- [ ] Support interactive and fully non-interactive execution.
- [ ] Validate Node, Java, Docker, ports, Git, package manager, and platform prerequisites.
- [ ] Offer a minimal default with advanced options hidden behind deliberate choices.
- [ ] Support PostgreSQL through Docker Compose by default and a fast H2 mode when appropriate.
- [ ] Initialize Git only when requested.
- [ ] Never require package registry credentials for public adoption.
- [ ] Produce actionable errors and recovery commands.
- [ ] Make reruns safe and avoid leaving partially initialized projects.
- [ ] Emit a concise next-step summary.
- [ ] Add anonymized telemetry only as explicit opt-in.

### 7.2 Supported variants

- [ ] Decide whether to support npm, pnpm, or both; publish one canonical path.
- [ ] Decide whether Java package name, database, authentication mode, offline support, and example capability are selectable.
- [ ] Avoid a combinatorial matrix that cannot be tested.
- [ ] Generate CI, environment examples, Docker Compose, VS Code tasks, and documentation matching selected options.
- [ ] Store generation metadata for future upgrades without making the project dependent on hidden state.

### 7.3 Doctor command

- [ ] Implement `vireo doctor` to inspect tool versions, ports, credentials, database connectivity, generated metadata, package alignment, service-worker state, and common configuration mistakes.
- [ ] Provide machine-readable output for CI and support requests.
- [ ] Redact secrets and personal paths by default.
- [ ] Attach stable diagnostic codes to documented remedies.

### 7.4 Upgrade command

- [ ] Detect current framework and template versions.
- [ ] Explain available releases and breaking changes.
- [ ] Run codemods and configuration migrations where safe.
- [ ] Produce a reviewable report for manual migrations.
- [ ] Never silently overwrite application-owned files.
- [ ] Support dry-run and patch-output modes.
- [ ] Test upgrades from every supported release line.

**Exit gate:** On a clean supported machine, an unfamiliar developer reaches a working browser application in under five minutes using one documented command and no private credentials.

---

## 8. Vertical-slice and code generation

### 8.1 Entity generator

- [ ] Design a schema describing fields, identifiers, constraints, enums, relationships, ownership, permissions, search, sorting, history, offline behavior, and UI presentation.
- [ ] Generate Flyway migrations.
- [ ] Generate JPA entity, DTO, mapper, repository, service, and controller layers.
- [ ] Generate validation with clear server/client ownership.
- [ ] Generate query-engine metadata and relation options.
- [ ] Generate history registration.
- [ ] Generate offline synchronization registration and conflict hooks when enabled.
- [ ] Generate TypeScript domain schemas, transport schemas, form models, mappers, API client, query keys, hooks, pages, routes, navigation, translations, stories, and tests.
- [ ] Generate responsive list, create, edit, details, empty, loading, error, and permission states.
- [ ] Support singular/plural names and localization from the start.
- [ ] Produce readable, idiomatic code developers are comfortable owning.

### 8.2 Generator safety

- [ ] Separate generated-once application code from regenerated derived code.
- [ ] Refuse destructive regeneration without explicit confirmation.
- [ ] Support dry-run, diff, and output-directory modes.
- [ ] Make generation deterministic.
- [ ] Snapshot-test every template.
- [ ] Compile and execute generated fixtures in CI.
- [ ] Test names containing acronyms, Unicode, reserved words, pluralization edge cases, compound identifiers, nullable fields, enums, money, dates, timestamps, and relationships.
- [ ] Version generator schemas.
- [ ] Document manual customization points.

### 8.3 Additional generators

- [ ] Capability/module generator.
- [ ] Page generator.
- [ ] Form/workflow generator.
- [ ] Settings section generator.
- [ ] Database migration generator.
- [ ] API adapter generator.
- [ ] Offline replay handler generator.
- [ ] History entity generator.
- [ ] Localization namespace generator.
- [ ] Story and test generator.
- [ ] Framework package generator for contributors.

**Exit gate:** A developer can generate, run, test, customize, and later upgrade a realistic full-stack entity without copying an example manually.

---

## 9. End-to-end type and wire-contract strategy

- [ ] Decide whether REST remains canonical or whether optional RPC/generated clients are introduced.
- [ ] Establish a single canonical description for endpoint paths, verbs, payloads, errors, pagination, sorting, filtering, and authentication semantics.
- [ ] Generate or validate TypeScript clients against backend contracts.
- [ ] Evaluate OpenAPI generation while preventing generated types from degrading domain modeling.
- [ ] Separate transport DTOs from domain and form models.
- [ ] Parse untrusted runtime data with Zod at documented trust boundaries.
- [ ] Standardize date, time, duration, decimal, currency, identifier, enum, nullability, and unknown-field semantics.
- [ ] Version cross-stack contracts explicitly.
- [ ] Add consumer-driven contract tests.
- [ ] Detect frontend/backend schema drift in CI.
- [ ] Define backward compatibility for rolling deployments.
- [ ] Standardize error envelopes and field-validation errors.
- [ ] Provide request correlation identifiers.
- [ ] Document file upload/download, streaming, SSE, and large-payload contracts.

**Exit gate:** A breaking backend contract cannot reach `main` without failing an automated frontend consumer or compatibility check.

---

## 10. Frontend architecture and runtime

### 10.1 Application composition

- [ ] Stabilize `app`, `features`, and `pages` ownership rules.
- [ ] Keep application composition visible and debuggable.
- [ ] Reduce provider boilerplate without hiding ordering.
- [ ] Formalize page registry types, route builders, access requirements, loading policy, navigation metadata, breadcrumbs, titles, and analytics names.
- [ ] Support nested routes, modal routes, deep links, optional parameters, and permission-denied outcomes.
- [ ] Add architecture checks for all documented boundaries.

### 10.2 State ownership

- [ ] Publish guidance distinguishing server state, form state, URL state, persistent preferences, offline state, transient UI state, and framework lifecycle state.
- [ ] Prevent duplicate sources of truth.
- [ ] Standardize query keys, invalidation, optimistic updates, cancellation, retries, and error reporting.
- [ ] Define cache persistence policy and data sensitivity rules.
- [ ] Make route changes and session expiry safely cancel in-flight work.

### 10.3 Performance

- [ ] Establish per-route and shared-chunk budgets.
- [ ] Measure cold start, warm start, route transition, input responsiveness, rendering, hydration, offline startup, and service-worker update time.
- [ ] Add representative low-end Android testing.
- [ ] Detect duplicate React, MUI, Emotion, Zod, i18next, and query runtimes.
- [ ] Make optional integrations tree-shakeable.
- [ ] Audit barrel exports and accidental side effects.
- [ ] Virtualize large collections where appropriate.
- [ ] Avoid unnecessary global contexts and broad rerenders.
- [ ] Provide performance profiling instructions.
- [ ] Define budgets for generated apps and fail CI on significant regressions.

### 10.4 Error handling and resilience

- [ ] Define recoverable, retryable, validation, authentication, authorization, connectivity, conflict, compatibility, and fatal error classes.
- [ ] Provide accessible user-facing error surfaces.
- [ ] Preserve useful state across recoverable errors.
- [ ] Add global and route-level error boundaries.
- [ ] Attach support-safe diagnostic identifiers.
- [ ] Ensure errors never expose secrets or stack traces in production.

**Exit gate:** Frontend architecture is enforceable, runtime behavior is observable, and representative performance budgets pass on desktop and low-end mobile profiles.

---

## 11. UI system and visual quality

### 11.1 Design system foundations

- [ ] Document typography, spacing, radius, elevation, color, density, iconography, motion, focus, breakpoint, touch-target, and responsive-layout tokens.
- [ ] Make tokens theme-level customization points.
- [ ] Define supported customization levels: brand, global component defaults, capability composition, and local escape hatch.
- [ ] Ensure light, dark, high-contrast, reduced-motion, and increased-text modes remain coherent.
- [ ] Provide branded and neutral example themes.

### 11.2 Component quality contract

For every public component:

- [ ] Define its purpose and non-purpose.
- [ ] Define controlled/uncontrolled behavior.
- [ ] Define loading, empty, error, disabled, read-only, permission, and offline states where relevant.
- [ ] Define mobile, tablet, desktop, touch, keyboard, pointer, and reduced-motion behavior.
- [ ] Define localization and bidirectional-text behavior.
- [ ] Define accessibility semantics and focus behavior.
- [ ] Define composition and customization boundaries.
- [ ] Provide focused stories and interaction tests.
- [ ] Test unusually long text, translated text, missing data, large values, and slow operations.
- [ ] Document performance characteristics for complex components.

### 11.3 Business-application primitives

- [ ] Responsive entity list/table/card system.
- [ ] Search, filter, saved-filter, sort, pagination, and selection patterns.
- [ ] Create/edit/details workflows.
- [ ] Related-record quick creation.
- [ ] Bulk actions with confirmation and progress.
- [ ] Import/export patterns.
- [ ] Audit/history viewer.
- [ ] Offline status, queue, conflict, and synchronization surfaces.
- [ ] Notification and activity surfaces.
- [ ] Settings and preference patterns.
- [ ] Permissions and unavailable-action explanation.
- [ ] Destructive-action safeguards.
- [ ] Long-running job and background-operation UI.
- [ ] Dashboard and summary-card patterns.
- [ ] Date, time, number, currency, quantity, unit, and country presentation.

### 11.4 Loading and perceived performance

- [ ] Finish the normative loading-state standard and audit.
- [ ] Ensure skeleton geometry matches loaded content.
- [ ] Distinguish bootstrap, navigation, refresh, mutation, background, and offline-rehydration loading.
- [ ] Avoid skeletons for operations too short to perceive.
- [ ] Prevent layout shift and focus loss.
- [ ] Respect reduced motion.
- [ ] Add automated or semi-automated screenshot comparison for skeleton/content alignment.

### 11.5 Motion and interaction polish

- [ ] Define motion duration, easing, interruption, and reduced-motion policy.
- [ ] Use motion to explain state change, hierarchy, continuity, and causality.
- [ ] Avoid decorative animation that delays work.
- [ ] Test rapid repeated interactions and interruption.
- [ ] Standardize hover, press, focus, drag, swipe, expansion, overlay, and route-transition feedback.
- [ ] Audit scroll behavior, sticky surfaces, overscroll, viewport resizing, virtual keyboard, safe areas, and installed-PWA chrome.

**Exit gate:** The demo is recognizably Vireo, feels intentional on mobile and desktop, passes accessibility checks, and has no known systemic loading/layout inconsistencies.

---

## 12. Accessibility and inclusive design

- [ ] Adopt WCAG 2.2 AA as the minimum public target.
- [ ] Publish an accessibility statement and known-limitations process.
- [ ] Test keyboard-only navigation for every critical workflow.
- [ ] Test screen readers on at least NVDA/Firefox or Chrome and VoiceOver/Safari.
- [ ] Test 200% and 400% zoom, reflow, text spacing, high contrast, reduced motion, and color-vision deficiencies.
- [ ] Ensure visible focus and logical focus order.
- [ ] Define focus restoration for dialogs, drawers, routes, errors, and dynamic content.
- [ ] Provide correct names, roles, states, descriptions, and live-region behavior.
- [ ] Ensure touch targets and gesture alternatives.
- [ ] Never rely solely on color, position, animation, or hover.
- [ ] Add automated axe checks to stories and representative pages.
- [ ] Document accessibility responsibilities inherited from MUI versus owned by Vireo/application code.
- [ ] Create an accessibility regression checklist for releases.
- [ ] Invite an external accessibility review before 1.0.

**Exit gate:** No critical or serious automated accessibility violations exist in canonical flows, and manual assistive-technology results are documented.

---

## 13. Forms, validation, and workflow UX

- [ ] Define one canonical form architecture using TanStack Form and Zod.
- [ ] Separate transport, domain, form, and submitted-command types.
- [ ] Support synchronous, asynchronous, cross-field, server, and uniqueness validation.
- [ ] Map backend field errors to frontend fields consistently.
- [ ] Define when validation occurs and how errors are announced.
- [ ] Preserve user input across recoverable failures.
- [ ] Standardize dirty tracking, reset, cancel, submit, close, and navigation guards.
- [ ] Support mobile button placement and virtual-keyboard behavior.
- [ ] Define multi-step form persistence and validation.
- [ ] Support conditional fields and dynamic collections.
- [ ] Define accessible date, numeric, currency, unit, autocomplete, and relation fields.
- [ ] Provide examples for file upload and progress.
- [ ] Protect against double submission.
- [ ] Define offline mutation behavior and queued-form feedback.
- [ ] Add generators and tests for standard forms.

**Exit gate:** Common business forms require composition rather than reinvention, while unusual workflows can use ordinary TanStack Form primitives.

---

## 14. PWA platform quality

### 14.1 Installation and manifests

- [ ] Validate manifest fields, icons, maskable icons, screenshots, categories, shortcuts, display modes, start URL, scope, theme colors, and orientation policy.
- [ ] Provide a product customization path for all manifest metadata.
- [ ] Test installability on supported Chromium desktop/Android and Safari/iOS behavior.
- [ ] Document platform limitations honestly.
- [ ] Ensure standalone navigation never escapes unexpectedly into a browser tab.

### 14.2 Service worker lifecycle

- [ ] Define service-worker registration, update detection, prompt, activation, reload, and rollback behavior.
- [ ] Prevent update loops and mixed-version frontend assets.
- [ ] Version caches and remove obsolete caches safely.
- [ ] Provide a recovery route when cached assets are corrupt.
- [ ] Ensure API caching policies cannot leak user data.
- [ ] Test logout, account switching, and shared-device behavior.
- [ ] Add automated update-across-version tests.

### 14.3 Platform capabilities

- [ ] Decide which capabilities are core, optional, experimental, or examples: notifications, push, background sync, periodic sync, share target, file handling, protocol handling, shortcuts, badges, wake lock, Web Share, clipboard, camera, geolocation, and storage persistence.
- [ ] Feature-detect every optional capability.
- [ ] Provide graceful fallbacks.
- [ ] Explain permissions before prompting.
- [ ] Avoid collecting permissions during initial onboarding.
- [ ] Test denial, revocation, unsupported browsers, and restricted environments.

### 14.4 Installed-app UX

- [ ] Test safe-area insets, mobile browser chrome, virtual keyboards, overscroll, back navigation, deep links, share entry, orientation changes, and display-mode differences.
- [ ] Define launch and resume behavior.
- [ ] Preserve meaningful state without showing stale sensitive data.
- [ ] Test low-memory eviction and process restarts.
- [ ] Provide offline launch behavior and a useful failure state when initial provisioning is incomplete.

**Exit gate:** Installation, update, offline launch, logout, and version transition are tested as first-class workflows rather than incidental Vite PWA behavior.

---

## 15. Offline-first architecture and synchronization

### 15.1 Scope and guarantees

- [ ] Define what “offline-capable” means in Vireo.
- [ ] Document which reads and mutations work offline.
- [ ] Define consistency, durability, ordering, idempotency, and conflict guarantees.
- [ ] Define behavior across multiple tabs, devices, users, tenants, and app versions.
- [ ] Publish explicit limits and unsupported cases.

### 15.2 Local database

- [ ] Define schema ownership, migration, rollback, corruption recovery, and reset behavior for SQLite/OPFS.
- [ ] Isolate data by user and tenant.
- [ ] Encrypt sensitive local data where feasible and document browser limitations.
- [ ] Define quota monitoring and storage-pressure behavior.
- [ ] Add indexes and query-plan testing for representative volumes.
- [ ] Prevent schema changes from stranding old clients.
- [ ] Provide safe database inspection only in development.

### 15.3 Hydration

- [ ] Define initial, incremental, resumed, interrupted, and forced hydration.
- [ ] Provide progress that represents meaningful work.
- [ ] Make hydration cancellable or safely resumable where possible.
- [ ] Validate checksums/revisions and detect incomplete local state.
- [ ] Handle large datasets through paging/streaming.
- [ ] Define readiness per capability rather than one opaque global boolean when appropriate.

### 15.4 Mutation queue and replay

- [ ] Persist commands durably before acknowledging offline completion.
- [ ] Use stable idempotency keys.
- [ ] Define dependencies between queued commands.
- [ ] Handle create-then-update/delete chains and temporary identifiers.
- [ ] Define retry, exponential backoff, poison-command, and manual intervention policies.
- [ ] Preserve normalized command bodies across app versions.
- [ ] Redact secrets and sensitive values from diagnostics.
- [ ] Provide queue inspection, retry, cancel, discard, and export support where safe.

### 15.5 Conflicts

- [ ] Classify conflicts: version, deletion, permission, validation, uniqueness, reference, business rule, and schema incompatibility.
- [ ] Provide default resolution policies only for objectively safe cases.
- [ ] Expose application-owned conflict resolvers.
- [ ] Preserve both versions for human resolution when data loss is possible.
- [ ] Design understandable user-facing conflict UI.
- [ ] Record resolution history.
- [ ] Test clock skew and out-of-order delivery.

### 15.6 Real-time convergence

- [ ] Define SSE reconnect, resumption, batching, ordering, deduplication, and authorization semantics.
- [ ] Reconcile real-time events with optimistic and queued local changes.
- [ ] Fall back to periodic reconciliation after missed events.
- [ ] Define heartbeat and stale-connection detection.
- [ ] Test proxy buffering, mobile suspension, network switching, and long disconnections.

### 15.7 Offline test matrix

- [ ] Offline before login.
- [ ] Offline immediately after login.
- [ ] Offline during hydration.
- [ ] Offline during mutation submission.
- [ ] Refresh while offline.
- [ ] Close and reopen while queued changes exist.
- [ ] Upgrade while offline.
- [ ] Logout with queued changes.
- [ ] Session expiry while offline.
- [ ] User switch on the same device.
- [ ] Two tabs writing concurrently.
- [ ] Two devices editing the same record.
- [ ] Server schema migration while an old client remains installed.
- [ ] Storage full, unavailable, corrupted, or cleared externally.

**Exit gate:** Offline guarantees are documented, adversarially tested, observable, and demonstrated with deliberate network interruption—not just a happy-path demo.

---

## 16. Backend framework quality

### 16.1 Spring Boot auto-configuration

- [ ] Follow current Spring Boot auto-configuration conventions.
- [ ] Provide configuration metadata, defaults, descriptions, and IDE completion.
- [ ] Use conditional beans predictably.
- [ ] Allow user beans to replace framework defaults.
- [ ] Avoid broad component scanning and surprising entity/repository discovery.
- [ ] Produce actionable startup failures.
- [ ] Test enabled, disabled, customized, missing-dependency, and override scenarios.
- [ ] Document bean names and extension points only when they are stable contracts.

### 16.2 Core CRUD abstractions

- [ ] Keep base entities/services/mappers minimal enough for real domain models.
- [ ] Avoid inheritance requirements that block alternative identifiers, aggregates, immutable models, soft deletion, or event-driven workflows.
- [ ] Provide composition-based alternatives.
- [ ] Define transaction boundaries.
- [ ] Define optimistic locking and concurrency behavior.
- [ ] Standardize paging and sorting without leaking persistence concerns unnecessarily.
- [ ] Verify MapStruct, Lombok, generated code, and native-image implications.

### 16.3 Database and migrations

- [ ] Support a clearly stated PostgreSQL range.
- [ ] Define H2 as test/dev convenience, not an implied production-equivalent database.
- [ ] Test framework migrations independently and alongside application migrations.
- [ ] Namespace migration locations and schemas safely.
- [ ] Test upgrades from every supported released schema.
- [ ] Define downgrade and failed-migration recovery expectations.
- [ ] Validate indexes and query plans on representative data.
- [ ] Document backup requirements before upgrades.

### 16.4 API behavior

- [ ] Standardize HTTP status codes, validation responses, paging, sorting, filtering, conditional requests, content types, and problem details.
- [ ] Support request IDs and structured logging context.
- [ ] Define API versioning strategy.
- [ ] Define rate limiting and abuse controls as application/deployment integrations.
- [ ] Prevent mass assignment and unsafe field binding.
- [ ] Provide secure CORS and trusted-proxy guidance.
- [ ] Document transaction and partial-failure semantics for batch endpoints.

### 16.5 Operations

- [ ] Integrate health, readiness, liveness, metrics, and build information safely.
- [ ] Ensure health endpoints do not leak sensitive configuration.
- [ ] Provide graceful shutdown and in-flight request handling.
- [ ] Define database pool sizing, timeouts, thread pools, and resource limits.
- [ ] Provide container/JVM memory guidance.
- [ ] Support structured logs and common observability adapters without mandatory vendor lock-in.

**Exit gate:** Every starter module can be enabled, disabled, customized, upgraded, and observed in an external consumer without depending on internal test knowledge.

---

## 17. Authentication, authorization, sessions, and tenancy

- [ ] Publish a threat model for the default authentication architecture.
- [ ] Define whether built-in username/password auth is production-ready, demonstrative, or replaceable.
- [ ] Use secure password hashing and migration-safe password policies.
- [ ] Add brute-force protection, rate limiting integration, and audit events.
- [ ] Define session creation, fixation protection, expiry, renewal, invalidation, concurrent sessions, remember-me, and logout semantics.
- [ ] Harden cookies: Secure, HttpOnly, SameSite, path, domain, lifetime, and proxy/TLS behavior.
- [ ] Define CSRF protection for session-authenticated APIs.
- [ ] Test CORS separately from CSRF.
- [ ] Provide account recovery, password change, username change, and forced-session invalidation patterns.
- [ ] Provide optional OIDC/OAuth2 integration guidance or adapter.
- [ ] Define frontend session recovery without redirect loops or data leakage.
- [ ] Enforce authorization server-side; frontend checks are UX only.
- [ ] Model roles, permissions, resource ownership, and policy extension points.
- [ ] Explain permission-denied behavior consistently across UI and API.
- [ ] Decide whether multi-tenancy is supported; if so, define tenant resolution, isolation, migrations, caching, local storage, history, and offline boundaries.
- [ ] Add security tests for horizontal/vertical privilege escalation and identifier enumeration.

**Exit gate:** The default security story is independently reviewed, documented, tested, and honest about which production integrations remain application-owned.

---

## 18. Query engine, search, filters, and saved views

- [ ] Define a versioned cross-stack filter document schema.
- [ ] Validate allowed entities, fields, operators, values, nesting depth, group size, and relation traversal.
- [ ] Prevent arbitrary property/path access.
- [ ] Prevent query denial of service through complexity budgets.
- [ ] Define null, empty, case, accent, locale, timezone, numeric, decimal, and date-range semantics.
- [ ] Keep PostgreSQL and SQLite results semantically aligned.
- [ ] Build a conformance suite that runs the same cases against both engines.
- [ ] Define search ranking and tokenization behavior.
- [ ] Test indexes and performance at representative volumes.
- [ ] Define relation filtering and cycle limits.
- [ ] Version saved filters and migrate or explain incompatible filters.
- [ ] Support parameterized saved filters safely.
- [ ] Define ownership, sharing, permissions, naming, duplication, and deletion of saved views.
- [ ] Provide accessible filter-builder UI and compact mobile application.
- [ ] Offer a simple search path that does not expose advanced-query complexity.

**Exit gate:** Equivalent filters return equivalent logical results online and offline, remain safe under hostile input, and have documented performance limits.

---

## 19. History, audit, privacy, and data governance

- [ ] Define the difference between user-facing history, security audit logs, technical logs, and event sourcing.
- [ ] Define which changes are recorded and at what transaction point.
- [ ] Preserve actor, tenant, correlation ID, timestamp, entity type, entity ID, operation, and changed values where appropriate.
- [ ] Avoid recording passwords, tokens, secrets, or prohibited personal data.
- [ ] Provide field-level redaction and exclusion hooks.
- [ ] Define retention, archival, deletion, and legal-hold responsibilities.
- [ ] Define behavior when source entities are deleted or identifiers reused.
- [ ] Ensure history authorization is independent of source-entity endpoint authorization.
- [ ] Make diff rendering safe for untrusted content and large payloads.
- [ ] Test concurrent changes and transaction rollbacks.
- [ ] Document GDPR-related application responsibilities without claiming automatic compliance.
- [ ] Provide export hooks for audit requirements.

**Exit gate:** History is reliable enough to explain business changes without becoming an uncontrolled sensitive-data store.

---

## 20. Localization and internationalization

- [ ] Define supported locale registration and fallback behavior.
- [ ] Prevent framework keys from colliding with application namespaces.
- [ ] Validate resources at build or startup time.
- [ ] Detect missing and unused keys.
- [ ] Support pluralization, interpolation, gender where needed, and rich content safely.
- [ ] Support locale-aware dates, times, relative time, numbers, currency, percentages, units, names, addresses, and sorting.
- [ ] Define timezone storage and display rules.
- [ ] Test long translations and pseudo-localization.
- [ ] Add right-to-left structural support or explicitly defer it with documented limitations.
- [ ] Keep error messages localizable without relying on backend prose as translation keys.
- [ ] Define locale persistence and account/device preference precedence.
- [ ] Make generated capabilities localization-ready.
- [ ] Establish a community translation contribution workflow.

**Exit gate:** Adding a locale is documented, validated, testable, and does not require editing framework internals.

---

## 21. Testing and quality strategy

### 21.1 Test pyramid and ownership

- [ ] Define what belongs in unit, component, integration, contract, architecture, browser, visual, performance, security, migration, packaging, and smoke tests.
- [ ] Eliminate duplicate tests that add time without distinct confidence.
- [ ] Require regression tests for fixed defects.
- [ ] Define flaky-test ownership and quarantine rules.
- [ ] Fail builds on unexpected skipped or focused tests.

### 21.2 Frontend verification

- [ ] Unit-test pure schemas, mappers, formatters, reducers, and query compilation.
- [ ] Component-test behavior through public interfaces.
- [ ] Run Storybook interaction and accessibility tests.
- [ ] Add visual regression tests for stable canonical states.
- [ ] Test browser flows with Playwright across supported engines.
- [ ] Test installed/display-mode behavior where automation permits.
- [ ] Test service-worker updates and offline transitions.
- [ ] Test production bundles, not only dev-server behavior.

### 21.3 Backend verification

- [ ] Unit-test domain rules.
- [ ] Integration-test Spring auto-configuration from external consumers.
- [ ] Test PostgreSQL behavior with containers.
- [ ] Test H2 only for intentionally portable behavior.
- [ ] Test migrations from released versions.
- [ ] Test authorization at endpoint and service boundaries.
- [ ] Test serialization and wire compatibility.

### 21.4 Cross-stack and release verification

- [ ] Run full vertical-slice flows against a real backend/database.
- [ ] Verify local and published package consumption.
- [ ] Verify packed npm tarballs and locally published Maven artifacts.
- [ ] Verify installation with empty package caches.
- [ ] Verify generated apps from scratch.
- [ ] Run supported OS/browser/Java/Node/database matrices.
- [ ] Test upgrade paths rather than only fresh installs.

### 21.5 Quality budgets

- [ ] Define maximum CI duration per lane.
- [ ] Parallelize independent frontend and JVM jobs.
- [ ] Make the fastest authoritative local check obvious.
- [ ] Keep a comprehensive release gate separate from rapid feedback.
- [ ] Track test duration and flakiness over time.
- [ ] Use coverage to find blind spots, never as the sole quality measure.

**Exit gate:** Every public claim maps to an automated test, documented manual check, or explicit limitation.

---

## 22. Security engineering and software supply chain

### 22.1 Secure development lifecycle

- [ ] Maintain threat models for authentication, offline storage/sync, query engine, service worker, package publishing, and generated applications.
- [ ] Add secure-design review to major feature proposals.
- [ ] Enable secret scanning, dependency review, code scanning, and automated dependency updates.
- [ ] Pin third-party CI actions to immutable revisions.
- [ ] Minimize workflow permissions.
- [ ] Protect release environments and branches.
- [ ] Require review for release workflow changes.
- [ ] Add security-focused tests for input handling, authorization, injection, XSS, CSRF, SSRF where applicable, insecure deserialization, path traversal, and sensitive logging.

### 22.2 Dependency policy

- [ ] Define criteria for adding runtime dependencies.
- [ ] Track license, maintenance health, transitive risk, bundle impact, and replacement cost.
- [ ] Remove unnecessary dependencies.
- [ ] Generate SBOMs for release artifacts.
- [ ] Establish vulnerability severity and response timelines.
- [ ] Document supported-version security policy.

### 22.3 Trusted releases

- [x] Publish npm packages publicly without consumer tokens.
- [x] Publish Maven artifacts through a broadly accessible public repository.
- [x] Use OIDC/trusted publishing for npm; protect in-memory signing and Central
      publication for Maven, where the registry does not offer the same OIDC path.
- [x] Generate npm provenance attestations and signed Maven artifacts.
- [ ] Produce checksums and release manifests.
- [ ] Target an appropriate SLSA build level.
- [ ] Run OpenSSF Scorecard and remediate meaningful findings.
- [ ] Pursue the OpenSSF Best Practices badge.
- [ ] Make release artifacts reproducible where practical.
- [ ] Separate build, approval, and publication responsibilities.

### 22.4 Vulnerability handling

- [ ] Publish `SECURITY.md` with private reporting instructions.
- [ ] Define acknowledgement, triage, embargo, fix, CVE/advisory, release, and disclosure workflows.
- [ ] Prepare security advisory and emergency release templates.
- [ ] Identify backup maintainers or trusted reviewers for critical incidents.
- [ ] Practice one tabletop incident before 1.0.

**Exit gate:** Consumers can verify artifact origin, report vulnerabilities privately, and understand which versions receive fixes.

---

## 23. Packaging, versioning, compatibility, and releases

- [x] Move from private GitHub Packages-only consumption to credential-free public installation.
- [ ] Decide whether frontend packages remain independently versioned or use a coordinated release train.
- [ ] Keep the JVM BOM authoritative for aligned backend modules.
- [ ] Publish a compatibility matrix across frontend packages, JVM modules, template, CLI, React, MUI, Spring Boot, Java, Node, PostgreSQL, and browsers.
- [ ] Define semantic-versioning interpretation for types, behavior, CSS, localization keys, schemas, migrations, generated code, and peer dependency floors.
- [ ] Define experimental API markers and stability guarantees.
- [ ] Require changesets/release notes for user-visible changes.
- [ ] Generate human-focused release notes grouped by adoption impact.
- [ ] Publish migration guides before breaking releases.
- [ ] Maintain supported release lines and end-of-life dates.
- [ ] Avoid unnecessary major releases caused by implementation detail.
- [ ] Test prereleases through canary tags.
- [ ] Provide release candidates for major versions.
- [ ] Automate package-content validation.
- [ ] Verify sourcemaps, type declarations, CSS, exports, tree shaking, peer dependencies, Javadocs, POM metadata, licenses, and source jars.
- [ ] Add rollback/withdrawal guidance for broken releases.

**Exit gate:** A developer can install, inspect provenance, select compatible versions, understand changes, and upgrade without privileged registry access.

---

## 24. Documentation information architecture

### 24.1 Documentation layers

- [ ] **Evaluation:** What Vireo is, who it is for, screenshots, demo, comparison, limitations, maturity, license.
- [ ] **Tutorial:** One linear first application ending in a useful deployed capability.
- [ ] **How-to guides:** Task-oriented recipes for common goals.
- [ ] **Concepts:** Lifecycle, offline model, query model, architecture, security, ownership, loading, responsive behavior.
- [ ] **Reference:** CLI, configuration, package APIs, annotations, components, schemas, errors, environment variables.
- [ ] **Operations:** Deployment, monitoring, backups, upgrades, incidents, browser support.
- [ ] **Contribution:** Repository setup, architecture rules, testing, releases, documentation, governance.

### 24.2 Documentation quality

- [ ] Make every command copy-pasteable and tested.
- [ ] Label working directories and expected output.
- [ ] State prerequisite versions near the relevant command.
- [ ] Avoid private paths, organization assumptions, and unavailable credentials.
- [ ] Test links, anchors, snippets, examples, and generated API references.
- [ ] Version documentation with releases.
- [ ] Add “introduced in,” “deprecated in,” and compatibility notes.
- [ ] Provide troubleshooting by symptom and diagnostic code.
- [ ] Add diagrams only where relationships are otherwise hard to understand.
- [ ] Make docs searchable, mobile-friendly, fast, accessible, and linkable.
- [ ] Add edit-this-page and report-a-problem paths.
- [ ] Record documentation analytics only with privacy-respecting consent and minimal data.

### 24.3 Essential guides

- [ ] Five-minute quickstart.
- [ ] Thirty-minute first vertical slice.
- [ ] Architecture tour.
- [ ] Build a real business workflow.
- [ ] Authentication customization.
- [ ] Authorization and permissions.
- [ ] Online-only entity.
- [ ] Offline-capable entity.
- [ ] Conflict resolution.
- [ ] Query filters and saved views.
- [ ] History and audit.
- [ ] Localization and timezone handling.
- [ ] Theme and brand customization.
- [ ] Loading/skeleton composition.
- [ ] Mobile and responsive behavior.
- [ ] Testing applications and extensions.
- [ ] Deployment and observability.
- [ ] Framework upgrade.
- [ ] Migrating an existing React/Spring application incrementally.
- [ ] Removing Vireo from an application or replacing a subsystem.

### 24.4 Documentation examples as tests

- [ ] Compile every TypeScript and Java snippet.
- [ ] Execute commands in clean CI fixtures.
- [ ] Prevent examples from importing private APIs.
- [ ] Keep screenshots synchronized with releases.
- [ ] Use the template and generated apps as executable documentation.

**Exit gate:** A developer can evaluate, start, customize, deploy, troubleshoot, and upgrade without needing maintainer assistance for documented paths.

---

## 25. README and GitHub conversion surface

- [ ] Open with the one-sentence value proposition, not repository structure.
- [ ] Show a high-quality short video/GIF of desktop, mobile, installation, offline transition, and synchronization.
- [ ] Include a concise capability summary tied to outcomes.
- [ ] Provide the shortest successful quickstart.
- [ ] Link immediately to live demo, docs, tutorial, examples, roadmap, and discussions.
- [ ] Include an architecture diagram showing application, frontend packages, backend modules, browser storage, and PostgreSQL.
- [ ] Add an honest comparison table.
- [ ] State maturity and production-readiness clearly.
- [ ] State supported versions and browser/platform limitations.
- [ ] Show package/license/build/security badges selectively; avoid badge clutter.
- [ ] Include a real screenshot above the fold.
- [ ] Explain why Vireo rather than merely listing what it contains.
- [ ] Include project provenance: built from real applications and what that taught.
- [ ] Provide a two-minute path for starring, trying, discussing, and contributing without begging for stars.
- [ ] Add repository social preview and release highlights.

**Exit gate:** Ten target developers can answer what Vireo is, why it matters, whether it fits them, and how to try it after scanning the README.

---

## 26. Demo and proof applications

### 26.1 Flagship demo

- [ ] Build one coherent, believable business application rather than a component gallery disguised as an app.
- [ ] Use realistic data, workflows, permissions, latency, empty states, errors, history, and offline scenarios.
- [ ] Provide guest/demo credentials or frictionless demo access.
- [ ] Reset demo data safely and regularly.
- [ ] Ensure no personal or production data is present.
- [ ] Make mobile installation and offline testing discoverable.
- [ ] Add an interactive “disable network” or guided offline demonstration where safe.
- [ ] Keep performance excellent on modest devices.
- [ ] Instrument errors and uptime.

### 26.2 Reference applications

- [ ] Keep `starter-template` minimal enough to clone and understand.
- [ ] Move broad demonstrations to a separate kitchen-sink/examples application if they obscure the golden path.
- [ ] Use Leather Production as an anonymized or public case study if legally and operationally appropriate.
- [ ] Add at least one independent external example before claiming generality.
- [ ] Add a deliberately customized example proving Vireo does not force every app to look identical.

### 26.3 Proof material

- [ ] Publish time-to-implement comparisons for a realistic vertical slice.
- [ ] Publish bundle, startup, offline volume, and query benchmarks with reproducible methodology.
- [ ] Publish architecture walkthroughs.
- [ ] Publish failure demonstrations: lost network, conflict, expired session, failed sync, update available.
- [ ] Publish adopter testimonials only when authentic and attributable.

**Exit gate:** The flagship demo makes the framework's value emotionally obvious before visitors read deep documentation.

---

## 27. Developer experience beyond the happy path

- [ ] Ensure errors state what failed, why, where, and what to do next.
- [ ] Assign searchable diagnostic codes to framework-specific failures.
- [ ] Provide source maps and readable development stacks.
- [ ] Keep generated types navigable in VS Code and IntelliJ.
- [ ] Add IDE completion for frontend config and Spring properties.
- [ ] Provide launch configurations and compound full-stack tasks without making them mandatory.
- [ ] Support fast local library + consumer development without stale artifacts.
- [ ] Detect mismatched local/published modes automatically.
- [ ] Eliminate manual alias lists where a manifest can be canonical.
- [ ] Make clean, build, test, lint, format, storybook, backend, frontend, and full-stack commands predictable.
- [ ] Provide a root command interface for the common workflow.
- [ ] Document debugger attachment, test debugging, service-worker debugging, SQLite inspection, and network simulation.
- [ ] Keep watch mode correct across file creation, deletion, rename, CSS, declarations, and public exports.
- [ ] Measure feedback time and preserve a sub-minute normal edit loop.
- [ ] Create a support bundle command that redacts secrets.

**Exit gate:** Common failures are self-diagnosing, and framework development does not require memorizing internal build mechanics.

---

## 28. Deployment and production operations

### 28.1 Official deployment paths

- [ ] Provide one canonical Docker Compose production-like deployment.
- [ ] Provide container images or reproducible container build templates.
- [ ] Decide whether frontend is served separately, by Spring Boot, or through documented variants.
- [ ] Provide reverse-proxy examples with TLS, compression, caching, API routing, SSE, and service-worker headers.
- [ ] Provide environment validation at startup/build time.
- [ ] Never bake secrets into frontend bundles.
- [ ] Provide PostgreSQL migrations and backup/restore procedures.
- [ ] Provide zero/low-downtime deployment guidance and compatibility requirements.

### 28.2 Cloud examples

- [ ] Add a small number of maintained recipes rather than superficial support for every provider.
- [ ] Cover one simple VPS deployment and one managed/cloud deployment.
- [ ] State cost assumptions and operational tradeoffs.
- [ ] Test deployment recipes regularly.

### 28.3 Observability

- [ ] Standardize structured server logs and correlation IDs.
- [ ] Provide metrics for requests, errors, latency, database pool, sync queue, hydration, SSE connections, and conflicts.
- [ ] Provide tracing integration guidance.
- [ ] Provide frontend error-reporting adapter hooks.
- [ ] Respect privacy and avoid capturing form values or local database content.
- [ ] Define health checks meaningful to orchestration.
- [ ] Add operational dashboards or example alerts.

### 28.4 Operations runbooks

- [ ] Database migration failure.
- [ ] Broken frontend/service-worker release.
- [ ] Package release regression.
- [ ] Authentication outage.
- [ ] Offline queue backlog.
- [ ] SSE fan-out/reconnection incident.
- [ ] Storage corruption or quota exhaustion.
- [ ] Vulnerability response.
- [ ] Rollback and forward-fix.

**Exit gate:** A competent developer can deploy, monitor, back up, upgrade, and recover the reference application using maintained documentation.

---

## 29. Browser, platform, and compatibility policy

- [ ] Define supported desktop and mobile browsers by version policy.
- [ ] Define installed-PWA support separately from browser-tab support.
- [ ] Define required versus optional APIs and fallbacks.
- [ ] Test Chromium, Firefox, Safari/WebKit, Android, iOS, and desktop installed mode according to policy.
- [ ] Define Java, Node, package manager, Spring Boot, React, MUI, PostgreSQL, Gradle, and operating-system support windows.
- [ ] Avoid requiring extremely new toolchains without a concrete benefit.
- [ ] Publish a compatibility matrix and automated test coverage matrix.
- [ ] Define deprecation timing before dropping a platform.
- [ ] Test timezone, locale, DST, slow CPU, low memory, limited storage, flaky connectivity, and proxy behavior.

**Exit gate:** “Supported” means continuously tested; everything else is explicitly best-effort or unsupported.

---

## 30. Open-source governance and community health

### 30.1 Community standards

- [ ] Maintain README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, SUPPORT, GOVERNANCE, and roadmap documents.
- [ ] Add issue forms for bugs, features, documentation, security redirection, and support questions.
- [ ] Add a pull-request template with testing, compatibility, documentation, security, and changeset prompts.
- [ ] Configure GitHub Discussions for questions, ideas, showcases, announcements, and RFCs.
- [ ] Label beginner-friendly and help-wanted work honestly.
- [ ] Add a contributor recognition mechanism.
- [ ] Publish communication expectations and response-time targets.

### 30.2 Decision process

- [ ] Define when an issue, discussion, RFC, ADR, or maintainer decision is appropriate.
- [ ] Publish RFC templates for public API and architectural changes.
- [ ] Keep final decisions discoverable.
- [ ] Define maintainer roles and promotion/removal criteria.
- [ ] Define conflict-of-interest and moderation processes.
- [ ] Preserve decisive product direction; community input does not mean design-by-committee.

### 30.3 Contribution experience

- [ ] Make contributor setup credential-free.
- [ ] Provide a single verification command and faster scoped commands.
- [ ] Document architecture rules with examples of accepted and rejected patterns.
- [ ] Automate formatting and mechanical checks.
- [ ] Provide test fixtures and generator helpers.
- [ ] Keep PRs reviewable and explain why changes are requested.
- [ ] Thank and credit contributors in releases.
- [ ] Avoid advertising issues as beginner-friendly when they require undocumented context.

### 30.4 Support model

- [ ] Separate bugs, usage questions, proposals, and security reports.
- [ ] Define free community support boundaries.
- [ ] Create a minimal reproducible-example template.
- [ ] Close stale requests with respectful, transparent policy rather than silent abandonment.
- [ ] Convert repeated questions into documentation or diagnostics.
- [ ] Consider sponsorship or paid support only after adoption creates real demand.

**Exit gate:** GitHub's community profile is complete, contribution paths are tested by an external contributor, and support boundaries protect maintainer time.

---

## 31. Legal, licensing, intellectual property, and compliance

- [ ] Confirm the chosen license covers all repositories and distributed artifacts.
- [ ] Include license files in npm, Maven, source, container, docs, and generated-project artifacts as appropriate.
- [ ] Audit third-party code, copied snippets, icons, fonts, images, demo data, and documentation for compatible licensing and attribution.
- [ ] Establish contributor licensing policy: Developer Certificate of Origin, CLA, or normal inbound=outbound terms.
- [ ] Add copyright notices where appropriate.
- [ ] Perform trademark clearance before investing heavily in brand.
- [ ] Publish trademark usage rules once community forks/integrations become plausible.
- [ ] Define privacy disclosures for website analytics, demo accounts, telemetry, crash reports, and mailing lists.
- [ ] Avoid claiming automatic GDPR, accessibility, security, accounting, or regulatory compliance.
- [ ] Consider EU Cyber Resilience Act implications if Vireo becomes commercially distributed or incorporated into products.
- [ ] Document export-control or cryptography considerations only if they become relevant.

**Exit gate:** Users can understand their rights and obligations, and Vireo has no known unlicensed assets or misleading compliance claims.

---

## 32. Website, content, and education

- [ ] Build a fast, accessible documentation/marketing website on the primary domain.
- [ ] Keep the homepage outcome-oriented and the docs task-oriented.
- [ ] Include interactive examples only when they remain fast and maintainable.
- [ ] Publish a “Why Vireo?” article with honest alternatives.
- [ ] Publish architecture deep dives for advanced developers.
- [ ] Publish short focused tutorials solving real business-app problems.
- [ ] Produce a concise launch video and reusable short clips.
- [ ] Produce diagrams explaining offline synchronization and full-stack contracts.
- [ ] Create a changelog feed and release announcement template.
- [ ] Maintain an examples/showcase directory.
- [ ] Invite community articles without implying official endorsement.
- [ ] Make all content version-aware and avoid abandoned tutorials.

### 32.1 Foundational content backlog

- [ ] “Build a production React + Spring Boot PWA in 30 minutes.”
- [ ] “Why offline business apps are harder than caching API responses.”
- [ ] “Vireo versus JHipster, Hilla, Refine, and React-admin.”
- [ ] “From JPA entity to responsive offline CRUD workflow.”
- [ ] “Designing skeletons that match real content.”
- [ ] “Testing service-worker updates without surprising users.”
- [ ] “One query model across PostgreSQL and SQLite.”
- [ ] “How Vireo keeps application code separate from framework code.”
- [ ] “How to escape Vireo abstractions safely.”
- [ ] “How Leather Production shaped Vireo.”

**Exit gate:** There is enough high-quality educational material for developers to discover Vireo through problems they already search for.

---

## 33. Launch and growth strategy

### 33.1 Private alpha

- [ ] Recruit 3–5 developers matching the target persona.
- [ ] Observe setup live without helping until they are blocked.
- [ ] Record time-to-run, time-to-first-slice, errors, confusion, and abandonment points.
- [ ] Fix systemic onboarding problems before adding requested breadth.
- [ ] Obtain permission before using quotes or logos.

### 33.2 Public alpha/beta

- [ ] Publish maturity labels and known limitations prominently.
- [ ] Use prerelease versions where contracts are unstable.
- [ ] Maintain a public beta feedback board.
- [ ] Run office hours or periodic feedback sessions only if sustainable.
- [ ] Publish frequent, honest progress updates.
- [ ] Prioritize successful independent applications over feature count.

### 33.3 Launch readiness package

- [ ] Excellent README.
- [ ] Public packages.
- [ ] Credential-free create command.
- [ ] Live demo.
- [ ] Five-minute quickstart.
- [ ] Thirty-minute tutorial.
- [ ] Comparison page.
- [ ] Architecture overview.
- [ ] Security policy.
- [ ] Contribution guide.
- [ ] Roadmap and maturity statement.
- [ ] Launch article.
- [ ] Two-minute video.
- [ ] Social preview cards and screenshots.
- [ ] Maintainer availability for the first launch week.

### 33.4 Distribution channels

- [ ] GitHub releases and repository topics.
- [ ] Java/Spring communities.
- [ ] React/TypeScript communities.
- [ ] PWA and offline-first communities.
- [ ] Hacker News when the demo and technical story are strong enough.
- [ ] Relevant Reddit communities with transparent, useful posts.
- [ ] Dev.to or personal technical blog.
- [ ] Short YouTube walkthroughs.
- [ ] Conference/user-group talks and podcasts when opportunities arise.
- [ ] Curated awesome lists only when Vireo genuinely meets their criteria.
- [ ] Partnerships/integrations with complementary tools after core adoption.

### 33.5 Ethical growth

- [ ] Never buy stars, use engagement rings, or automate unsolicited promotion.
- [ ] Never claim production adoption without evidence.
- [ ] Avoid repeated cross-posting with identical promotional content.
- [ ] Lead with useful technical material.
- [ ] Measure which audiences become real users, not which produce shallow traffic.

**Exit gate:** Launch traffic can convert through the entire discovery-to-first-value funnel without direct maintainer intervention.

---

## 34. Product analytics, research, and feedback loops

- [ ] Define decisions that analytics would inform before collecting data.
- [ ] Prefer aggregate, privacy-preserving website and package metrics.
- [ ] Make CLI telemetry opt-in and explain every collected field.
- [ ] Never collect source code, entity names, paths, credentials, business data, or database contents.
- [ ] Track documentation searches with no results.
- [ ] Track recurring support topics and failure diagnostic codes.
- [ ] Run periodic adopter interviews.
- [ ] Maintain a public or internal evidence register linking roadmap decisions to user evidence.
- [ ] Distinguish vocal requests from common needs.
- [ ] Measure retention through upgrade behavior and continued project activity where ethically observable.
- [ ] Review and delete unnecessary analytics data.

**Exit gate:** Product decisions can cite evidence without compromising user privacy.

---

## 35. Maintainer sustainability and project economics

- [ ] Define maximum supported scope and a process for saying no.
- [ ] Budget maintenance time separately from feature work.
- [ ] Automate releases, dependency updates, triage, reproduction, and common diagnostics.
- [ ] Establish support expectations that do not imply 24/7 availability.
- [ ] Recruit at least one trusted backup maintainer before declaring 1.0 critical infrastructure.
- [ ] Document bus-factor risks and release recovery access.
- [ ] Secure package, domain, organization, signing, and deployment accounts with hardware-backed 2FA and recovery procedures.
- [ ] Keep credentials out of any single workstation.
- [ ] Consider GitHub Sponsors, consulting, paid support, hosted services, or commercial add-ons only if they reinforce open-source trust.
- [ ] Never degrade the open-source core solely to force monetization.
- [ ] Review burnout indicators quarterly.
- [ ] Pause growth campaigns when support quality would suffer.

**Exit gate:** The project can survive maintainer absence, a security incident, and a burst of adoption without collapsing operationally.

---

## 36. Competitive strategy and recurring review

- [ ] Review JHipster for generation breadth, deployment support, and community model.
- [ ] Review Hilla for React/Spring integration, type-safe endpoints, security, and developer tooling.
- [ ] Review Refine for headless adapters, CRUD DX, examples, and onboarding.
- [ ] Review React-admin for mature B2B primitives, documentation, accessibility, and extensibility.
- [ ] Review relevant offline/local-first systems for synchronization models and limitations.
- [ ] Maintain a capability comparison based on user outcomes, not checkbox inflation.
- [ ] Identify features Vireo should intentionally not copy.
- [ ] Update comparisons at least twice yearly and before major positioning changes.
- [ ] Never build against competitor marketing alone; test their actual developer experience.

**Exit gate:** Vireo can explain its unique tradeoffs confidently without claiming that competitors are inferior in every dimension.

---

## 37. Proposed phased execution plan

The following sequence minimizes the risk of spending months polishing internals before validating adoption.

### Phase 0 — Evidence and scope lock (2–4 weeks)

- Complete the baseline audit.
- Interview target users.
- Finalize positioning, audience, non-goals, maturity language, and supported scope.
- Resolve public naming and package-distribution constraints.
- Define success metrics.

**Gate:** Demonstrated target-user interest and no unresolved identity/distribution blocker.

**2026-08-27 closure variance:** **CONDITIONAL GO — Phase 0 AI proxy passed;
live target-developer validation deferred to public beta as an accepted risk.**
Public repositories and canonical npm/Maven artifacts are anonymously consumable;
positioning, competitor, and clean-onboarding evidence is provisional AI evidence.
It does not demonstrate human interest, adoption intent, or product-market fit.
Revisit the retained human protocol after the first three independent adopters or
before a 1.0 commitment, whichever comes first. The dated evidence and accepted
risks are recorded in the
[closure review](docs/roadmap/phase-0/phase-0-gate-review-2026-08-27.md).

### Phase 1 — Public foundation and trust (3–6 weeks)

- Credential-free public package distribution.
- Repository hygiene and community health files.
- Compatibility and release policy.
- Security policy, dependency automation, trusted publishing, and provenance.
- Minimal documentation website and rewritten README.
- Clean-install CI across supported environments.

**Gate:** A stranger can inspect, install, verify, and legally adopt Vireo.

**Current state:** Phase 1 is the next authorized phase. Public source and artifact
distribution are already active; remaining work centers on accurate external
repository metadata, governance/support and compatibility contracts, executable
documentation, the admitted clean-room matrix, security/SBOM/recovery evidence,
and the complete unfamiliar-user gate. The original duration is not a commitment;
the current backlog estimates remaining active effort separately from external wait.

### Phase 2 — Golden-path DX (4–8 weeks)

- Create command.
- Root development workflow.
- Doctor command.
- Minimal template separation from kitchen-sink examples.
- Thirty-minute vertical-slice tutorial.
- Actionable diagnostics and clean-room onboarding fixes.

**Gate:** At least 70% of external testers reach a running app without help.

### Phase 3 — Killer workflow (6–12 weeks)

- Schema model and full-stack entity/capability generator.
- Wire-contract validation/generation.
- Generated migration, backend, frontend, localization, stories, and tests.
- Dry-run, deterministic output, and safe ownership model.
- Generated fixture compilation and E2E verification.

**Gate:** External users independently generate and customize a realistic vertical slice and report meaningful time saved.

### Phase 4 — Production hardening (6–12 weeks, overlapping)

- Authentication/security review.
- Offline guarantees, conflict model, schema upgrades, and adversarial tests.
- Accessibility audit.
- Browser/platform matrix.
- Performance budgets.
- Deployment, observability, backup, upgrade, and incident runbooks.
- Release compatibility tests.

**Gate:** Written production-readiness criteria pass and known limitations are public.

### Phase 5 — Flagship experience and public beta (4–8 weeks)

- Visually exceptional flagship demo.
- Example applications and proof material.
- Comparison pages, videos, tutorials, and architecture content.
- Public beta feedback loop.
- First independent production adopters.

**Gate:** Three independent teams are actively building with Vireo and at least one has deployed it.

### Phase 6 — Launch and sustained growth (ongoing)

- Coordinated 1.0 or major public release.
- Launch content and community outreach.
- Responsive support and rapid onboarding fixes.
- Regular releases and transparent roadmap updates.
- Contributor development and showcase program.
- Metrics review and positioning refinement.

**Gate:** Growth remains organic, activated users increase, support remains sustainable, and upgrades work across releases.

---

## 38. Release-readiness checklists

### 38.1 Public alpha

- [ ] Public license and packages.
- [ ] No consumer credentials required.
- [ ] Quickstart passes from clean environments.
- [ ] Known limitations and experimental APIs documented.
- [ ] Security reporting available.
- [ ] No known critical security issue.
- [ ] Minimal working demo.
- [ ] Feedback location and support boundaries established.

### 38.2 Public beta

- [ ] Create and doctor commands stable enough for external use.
- [ ] Vertical-slice workflow documented.
- [ ] Upgrade experiments running.
- [ ] Compatibility matrix published.
- [ ] Accessibility and offline audits underway with results public.
- [ ] At least three external evaluators completed onboarding.
- [ ] Release notes and migrations consistently published.

### 38.3 Version 1.0

- [ ] Stable framework kernel and lifecycle.
- [ ] Defined semver and deprecation guarantees.
- [ ] Tested upgrade path from supported prereleases.
- [ ] Production security review completed.
- [ ] Offline guarantees and limitations finalized.
- [ ] Supported browser/tool/database matrices green.
- [ ] Deployment and recovery runbooks tested.
- [ ] Full documentation layers available.
- [ ] Flagship demo reliable.
- [ ] At least one independent production deployment.
- [ ] Backup release/security maintainer identified.
- [ ] No unresolved issue that would require immediate breaking redesign.

---

## 39. Definition of done for every roadmap item

An item is not complete merely because code exists. Unless explicitly inapplicable, “done” means:

- [ ] User problem and scope are documented.
- [ ] Public API and ownership boundaries are documented.
- [ ] Security and privacy implications are reviewed.
- [ ] Accessibility implications are reviewed.
- [ ] Online, offline, mobile, desktop, localization, error, and loading implications are considered.
- [ ] Unit/integration/contract/browser tests exist at the appropriate level.
- [ ] Documentation and examples are updated.
- [ ] Generated code/templates are updated where applicable.
- [ ] Migration and compatibility impact is recorded.
- [ ] Performance and bundle impact are measured where relevant.
- [ ] Diagnostics are actionable.
- [ ] Release notes or changeset exist.
- [ ] The feature is verified from a clean external consumer, not only inside the framework repository.
- [ ] A rollback or recovery path exists for risky changes.

---

## 40. Risk register

| Risk                          | Why it matters                                       | Mitigation                                                                  |
| ----------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------- |
| Scope explosion               | Full-stack frameworks can become infinite projects   | Enforce primary persona, non-goals, and capability admission criteria       |
| Architecture ahead of product | Deep internals may not translate to visible value    | Validate with external onboarding and vertical-slice outcomes               |
| Solo-maintainer bottleneck    | Adoption can create support and security obligations | Automate, document, constrain support, recruit trusted maintainers          |
| Private-registry friction     | Developers abandon before evaluation                 | Public credential-free packages and create command                          |
| Offline overclaiming          | Data loss or conflicts can destroy trust             | Publish precise guarantees, adversarial tests, application-owned resolution |
| Excessive opinion             | Real applications eventually differ                  | Stable escape hatches and ejectable generated code                          |
| Excessive flexibility         | Configuration matrix becomes untestable              | One golden path and a deliberately small supported matrix                   |
| Framework lock-in fear        | Teams avoid strategic dependency                     | Ordinary React/Spring code, documented subsystem replacement and exit path  |
| Breaking-release fatigue      | Users stop upgrading                                 | Stable kernel, semver discipline, codemods, compatibility fixtures          |
| UI becomes generic            | Vireo loses its visible differentiation              | Strong design system, flagship demo, intentional responsive behavior        |
| UI becomes inflexible         | Every app looks identical or requires forks          | Theme-level brand customization and composition escape hatches              |
| Security incident             | Framework trust can collapse quickly                 | Threat models, trusted releases, reporting process, rapid response          |
| Dependency churn              | React/MUI/Spring upgrades consume roadmap            | Support windows, compatibility policy, scheduled upgrade work               |
| Docs drift                    | Sophisticated features become unusable               | Executable snippets, generated reference, clean-install docs CI             |
| Launch without retention      | Stars rise briefly but ecosystem does not form       | Optimize activation, production adoption, upgrades, and community proof     |
| Premature 1.0                 | Compatibility promises freeze flawed contracts       | External beta projects and explicit readiness gate                          |
| Branding collision            | Discoverability and legal investment are lost        | Early trademark/domain/package research                                     |

---

## 41. Immediate next 20 actions

These are the recommended first actions, in order:

1. [x] Decide and write the provisional primary audience and non-goals (D-101;
       human validation remains deferred under D-110).
2. [x] Produce a dated baseline scorecard from the current repositories.
3. [ ] Interview five unfamiliar React + Spring Boot developers (deferred to the
       public-beta validation gate; zero completed).
4. [ ] Test the proposed positioning language with those developers (AI proxy only;
       human testing deferred).
5. [ ] Complete Vireo professional clearance and external profile consistency;
       domain, public repositories, npm scope, and Maven coordinates are active.
6. [x] Decide the canonical public repository topology.
7. [x] Make package installation credential-free.
8. [x] Define the supported toolchain/browser/database matrix (individual support
       rows remain inactive until their enforcement evidence passes).
9. [x] Rewrite the README around outcomes, maturity, ownership, and limitations;
       a hosted demo remains future work.
10. [ ] Separate minimal template responsibilities from demonstration/kitchen-sink content.
11. [ ] Build the one-command create workflow.
12. [ ] Run observed clean-room onboarding and fix every blocker.
13. [ ] Specify the vertical-slice entity schema and generated ownership model.
14. [ ] Implement the smallest end-to-end generator proving the concept.
15. [ ] Formalize and test frontend/backend wire-contract drift detection.
16. [ ] Publish precise offline guarantees and a threat model.
17. [ ] Build the flagship demo scenario and visual-quality bar.
18. [ ] Establish trusted releases, provenance, security reporting, and compatibility policy.
19. [ ] Recruit the first three external pilot projects.
20. [ ] Launch only after the full discovery-to-first-value path succeeds without maintainer help.

---

## 42. Final strategic rule

The project will not reach thousands of stars because it contains the most abstractions, packages, components, checks, or documentation pages. It can reach that level if a specific group of developers sees Vireo and immediately believes:

1. It solves a painful problem they actually have.
2. It produces a noticeably better application than their usual starting point.
3. They can understand and try it quickly.
4. They retain control of ordinary React and Spring Boot code.
5. The framework is safe to adopt, operate, and upgrade.
6. The maintainer and community will treat their trust responsibly.

Every roadmap decision should strengthen at least one of those beliefs. If it strengthens none, it is probably not on the critical path to adoption.

---

## 43. External standards and reference points

Use current official guidance during implementation rather than treating this roadmap as a frozen specification:

- GitHub community profile and repository health guidance: <https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories>
- GitHub README guidance: <https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes>
- OpenSSF Scorecard: <https://openssf.org/projects/scorecard/>
- OpenSSF Best Practices Badge: <https://openssf.org/projects/best-practices-badge/>
- SLSA specification: <https://slsa.dev/spec/v1.2/>
- npm trusted publishing and provenance: <https://docs.npmjs.com/trusted-publishers/>
- JHipster: <https://www.jhipster.tech/>
- Hilla: <https://vaadin.com/hilla>
- Refine: <https://refine.dev/core/docs/>
- React-admin: <https://marmelab.com/react-admin/>

Review applicable standards again at implementation time because security, accessibility, browser, package-registry, and platform guidance changes.
