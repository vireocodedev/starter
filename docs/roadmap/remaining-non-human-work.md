# Remaining work that does not require human evaluation

Baseline date: 2026-08-28

Status: **active planning checklist**

This checklist reconciles the remaining Vireo roadmap work that can be completed
without unfamiliar-user studies, independent adopter evidence, independent expert
assessment, or manual assistive-technology/device evaluation. It uses the numbered
phase backlogs as the completion authority; unchecked boxes in the older master
roadmap are not automatically evidence that already-implemented work remains open.

Phase 6 identifiers below are proposed planning identifiers until `P6-00` versions
the official Phase 6 backlog. Deferred engineering is intentionally separated from
the launch critical path and must not be admitted merely to make the product appear
broader.

## Completion rules

- [ ] Tick a parent item only when every required child is complete or explicitly
      removed by a dated roadmap decision.
- [ ] Link completed items to a commit, hosted run, retained artifact, or dated
      decision.
- [ ] Keep engineering evidence distinct from human, independent, manual, field,
      and adoption evidence.
- [ ] Do not use this checklist to declare the Phase 4 or Phase 5 external gates
      complete.
- [ ] Reconcile this checklist whenever an authoritative phase backlog changes.

## Existing numbered carry-over

### `P1-03` — Repository migration and compatibility sequencing

- [ ] Decide whether to execute the accepted repository rename plan or supersede it
      with a dated decision to retain the current public names.
- [ ] If renaming, tag and archive the older conflicting Template repository.
- [ ] If renaming, move `starter` to `vireo` and `starter-template` to
      `vireo-template` in the documented order.
- [ ] Update remotes, repository links, package metadata, badges, CODEOWNERS,
      workflows, release consumers, provenance identities, and cross-repository
      references.
- [ ] Verify GitHub redirects, anonymous clone/install paths, public documentation,
      release workflows, and clean consumers after the decision is executed.
- [ ] Publish compatibility or redirect guidance for every public name that changes.
- [ ] Update `P1-03`, D-104, and the repository-topology record with final evidence.
- [ ] Mark `P1-03` complete.

### `P1-09` / `G-107` — Machine-controlled provider security

Checked-in desired state and the authenticated 2026-08-31 application record are available in
[`docs/security/provider-controls-2026-08-31.md`](../security/provider-controls-2026-08-31.md),
The single-owner interim policy deliberately does not claim independent review.

- [x] Add a `main` branch ruleset or equivalent branch protection to Starter.
- [x] Add a `main` branch ruleset or equivalent branch protection to Template.
- [x] Require pull requests, resolved conversations, and successful checks for protected-branch changes.
- [x] Put release-workflow changes behind the same PR/check controls; independent approval remains the documented human gap.
- [x] Narrow the organization/repository GitHub Actions allowlist from provider-wide
      `all` while retaining every required pinned action.
- [x] Restrict the `maven-central` environment to intended branches/tags.
- [x] Restrict the `github-pages` environment to intended branches/tags.
- [ ] Remove unnecessary administrator bypass from protected release/deployment
      environments in the GitHub UI and retain the authenticated GET export.
- [x] Re-audit private vulnerability reporting, secret scanning, push protection,
      Dependabot, default workflow permissions, and action-SHA enforcement.
- [x] Update the recovery exercise and `G-107` with provider evidence.
- [ ] Mark the machine-controlled portion of `P1-09` complete.

The backup-owner recovery exercise is not included here because it requires another
trusted person, even though it is an operational exercise rather than product-user
evaluation.

### `G-108` — Verification resource and trend evidence

- [ ] Accumulate five comparable successful hosted Starter verification records.
- [ ] Accumulate five comparable successful hosted Template verification records.
- [ ] Confirm that the records use the documented host class, cache state, schema,
      duration, and peak-RSS method.
- [ ] Review the earlier transient Starter warnings against the five-run median.
- [ ] Approve or reject any threshold adjustment using the documented policy.
- [ ] Retain the reviewed evidence and decision for the required period.
- [ ] Update the gap register and mark `G-108` complete.

### `G-305` — Maintainer-run target-environment recovery preparation

- [ ] Take a guarded backup of the hosted demo database.
- [ ] Verify the backup before accepting it as recovery input.
- [ ] Restore representative data into a new database or isolated recovery target.
- [ ] Verify Flyway history, application readiness, authentication, and the Item
      journey after restore.
- [ ] Measure and record recovery time and recovery point.
- [ ] Exercise one sanitized demo incident, containment, rollback or forward-fix,
      and post-incident verification.
- [ ] Retain sanitized commands, timings, logs, revision, and results.
- [ ] Update the operations evidence without claiming that the required independent
      witness row passed.

This work strengthens `G-305`, but the Phase 4 gate still requires a witnessed
target-environment rehearsal.

### Roadmap and release-state reconciliation

- [ ] Mark hosted-demo gap `G-308` complete in the gap register.
- [ ] Remove the stale master-roadmap statement that host activation remains open.
- [ ] Reconcile `P1-03`, `P1-09`, and `G-108` with current evidence.
- [ ] Reconcile public `create-vireo`, npm, Maven, Template, and Starter versions.
- [ ] Reconcile the public-alpha, public-beta, and 1.0 readiness checklists without
      converting external/manual rows into passing claims.
- [ ] Link the active demo, health journey, reset evidence, monitoring workflow, and
      incident path from the authoritative roadmap surfaces.
- [ ] Establish and link the official numbered Phase 6 backlog.

## Proposed Phase 6 backlog

### `P6-00` — Phase 6 baseline and launch gate

- [ ] Reconcile Phases 0–5 and their closure evidence.
- [ ] Define the difference between launch preparation, public launch, public-beta
      readiness, and a 1.0 commitment.
- [ ] Define Phase 6 scope, non-goals, evidence classes, hold conditions, and exit
      gate.
- [ ] Define measurable activation, retention, support, release, and sustainability
      indicators without treating stars as proof of adoption.
- [ ] Create a machine-readable launch-readiness record and validator.
- [ ] Publish the official numbered Phase 6 backlog.

### `P6-01` — Brand and discovery assets

- [ ] Audit the current Vireo Framework / Vireo Code identity across public surfaces.
- [ ] Create or refine the logo and favicon at required sizes.
- [ ] Create GitHub social-preview artwork.
- [ ] Create reusable architecture-diagram and screenshot templates.
- [ ] Publish brand usage and qualified-naming guidance.
- [ ] Standardize repository, package, documentation, and demo descriptions.
- [ ] Define honest search vocabulary and page metadata around React, Spring Boot,
      business applications, PWA, generation, and offline boundaries.
- [ ] Verify repository topics, package metadata, canonical URLs, and public links.

Professional trademark clearance is excluded because it requires external
professional assessment.

### `P6-02` — Primary website and conversion funnel

- [x] Build the standalone deployable `vireocode.com` landing artifact.
- [x] Lead with the qualified value proposition, audience, maturity, and limitations.
- [x] Link the live demo, quickstart, tutorial, documentation, comparison,
      architecture, security policy, roadmap, packages, source, Discussions, and
      contribution path.
- [ ] Add real screenshots, architecture proof, and restrained status badges.
- [x] Add accessible responsive behavior, reduced-motion handling, and keyboard
      focus treatment.
- [x] Add description/Open Graph metadata, canonical URL, robots policy, sitemap,
      favicon, health route, and static 404 page.
- [ ] Add final raster social-preview cards and `og:image` metadata.
- [x] Derive the current CLI, npm, JVM, source, compatibility, and documentation
      release links from the enforced documentation release policy.
- [x] Add source-policy, rendering, artifact, workflow-security, and drift checks.
- [ ] Add hosted browser accessibility, link, performance, and proof-surface checks.
- [x] Activate the standalone artifact on the VPS at `https://vireocode.com`.
- [x] Verify the complete anonymous discovery-to-first-action path.

Core infrastructure was implemented in Starter commit `3c4b08c`: `site/` owns the
standalone build, Vireo-specific presentation, release-derived public model, VPS
deployment script and Caddy contract; `.github/workflows/website.yml` builds and
retains the artifact without replacing the GitHub Pages documentation portal.
The one-time host bootstrap was added in `7069011` and activated on 2026-08-28 as
release `706901125c26-20260828T103454Z`. The live TLS, health, metadata, redirect,
404, cache, demo, documentation, API, registry, quickstart, tutorial, community,
and first-run-command paths were then verified anonymously. The corresponding
[hosted website artifact run](https://github.com/vireocodedev/starter/actions/runs/33163891340)
passed independently.

### `P6-03` — Documentation completion

- [ ] Publish authentication customization guidance.
- [ ] Publish authorization and permission-extension guidance.
- [ ] Publish an online-only capability guide.
- [ ] Publish offline-capable boundaries and conflict-handling guidance without
      implying unsupported Template domain synchronization.
- [ ] Publish query-filter and saved-view guidance.
- [ ] Publish history and audit guidance.
- [ ] Publish localization and timezone guidance.
- [ ] Publish loading and skeleton-composition guidance.
- [ ] Publish mobile and responsive application guidance.
- [ ] Publish application and extension testing guidance.
- [ ] Document debugger attachment, test debugging, service-worker debugging,
      SQLite inspection, and network simulation.
- [ ] Complete deployment and observability guidance.
- [ ] Complete framework-upgrade guidance for every supported release pair.
- [ ] Publish an incremental existing React/Spring application migration guide.
- [ ] Publish subsystem replacement and Vireo-removal guidance.
- [ ] Compile every normative TypeScript and Java snippet in CI.
- [ ] Execute documented commands in clean fixtures.
- [ ] Prevent examples from importing private APIs.
- [ ] Keep screenshots synchronized with supported releases.

Multi-theme guidance is intentionally absent because the owner abandoned that work.

### `P6-04` — Launch content and media

- [ ] Publish an honest “Why Vireo?” article.
- [ ] Draft and version the launch article.
- [ ] Publish a React/Spring architecture deep dive.
- [ ] Publish “Why offline business apps are harder than caching API responses.”
- [ ] Publish an entity-to-full-stack-workflow tutorial.
- [ ] Publish a service-worker update and recovery article.
- [ ] Publish a PostgreSQL/SQLite query-model article.
- [ ] Publish an application ownership and escape-hatch article.
- [ ] Prepare a two-minute video script and shot list.
- [ ] Produce the launch video and reusable short clips.
- [ ] Produce architecture, contract, deployment, and offline-boundary diagrams.
- [ ] Create a reusable release-announcement template and release highlights.

Any Leather Production case study requires a separate legal/privacy publication
decision and is not assumed by this checklist.

### `P6-05` — Proof, examples, and benchmarks

- [ ] Create an examples/showcase structure with explicit support classifications.
- [ ] Add a deliberately customized example proving that application composition is
      not visually or architecturally locked to the flagship.
- [ ] Publish reproducible bundle-size benchmarks.
- [ ] Publish reproducible startup and first-use benchmarks.
- [ ] Publish reproducible query benchmarks against representative volumes.
- [ ] Publish reproducible offline-storage/volume measurements for the declared
      SQLite scope.
- [ ] Publish maintainer-run time-to-implement measurements for a realistic generated
      vertical slice without presenting them as external-user evidence.
- [ ] Publish failure demonstrations for lost network, expired session, update
      available, failed synchronization, and supported conflict states.
- [ ] Automate example builds, benchmark methodology checks, and result retention.

Independent examples, case studies, quotes, and testimonials are excluded until
authentic evidence and publication permission exist.

### `P6-06` — Community and contributor operations

- [ ] Define when work belongs in an issue, Discussion, RFC, ADR, or maintainer
      decision.
- [ ] Publish an RFC template for public API and architectural changes.
- [ ] Publish or standardize the ADR template and discoverable decision index.
- [ ] Document maintainer roles, promotion, removal, moderation, and
      conflict-of-interest handling.
- [ ] Add a contributor-recognition mechanism.
- [ ] Add release-credit automation for external contributors.
- [ ] Define honest `good first issue` and `help wanted` criteria.
- [ ] Create a minimal reproducible-example template.
- [ ] Publish a respectful and transparent stale-request policy.
- [ ] Add automation that routes bugs, usage questions, proposals, documentation
      issues, and security reports correctly.
- [ ] Add or verify Discussions categories for questions, ideas, showcases,
      announcements, and RFCs.
- [ ] Define the process for converting recurring support questions into
      documentation or diagnostics.

### `P6-07` — Support and diagnostic automation

- [ ] Implement a privacy-safe support-bundle command.
- [ ] Redact credentials, personal paths, environment secrets, source code, entity
      names, request bodies, and application data from support output.
- [ ] Add IDE completion for supported frontend configuration where useful.
- [ ] Add Spring configuration metadata and IDE completion for public properties.
- [ ] Verify VS Code and IntelliJ launch/debug configurations.
- [ ] Detect mismatched local-source and published-package development modes.
- [ ] Measure normal edit-loop feedback time and enforce the chosen budget.
- [ ] Track recurring diagnostic codes without collecting private application data.
- [ ] Automate safe issue-triage and reproduction scaffolding.

### `P6-08` — Release and supply-chain maturity

- [ ] Generate consistent release manifests and checksums for all public artifacts.
- [ ] Add OpenSSF Scorecard and review meaningful findings.
- [ ] Document the achieved SLSA build level and remaining limitations.
- [ ] Apply for the OpenSSF Best Practices badge when its objective criteria pass.
- [ ] Improve artifact reproducibility where practical and document byte-level
      exceptions.
- [ ] Define and automate canary/prerelease tags.
- [ ] Define a release-candidate process for major versions.
- [ ] Publish supported-release lines and end-of-life records.
- [ ] Add security-advisory and emergency-release templates.
- [ ] Generate human-focused release notes grouped by adoption impact.
- [ ] Keep migration guidance available before breaking releases.
- [ ] Maintain rollback, deprecation, withdrawal, and forward-fix guidance.

### `P6-09` — Privacy-safe metrics and evidence

- [ ] Define the decisions each proposed metric would inform before collecting it.
- [ ] Define a minimal aggregate website, package, CI, demo-health, documentation,
      and release evidence schema.
- [ ] Keep CLI telemetry disabled unless an explicit opt-in design is separately
      accepted.
- [ ] Prohibit collection of source code, paths, credentials, entity names,
      business data, database contents, and form values.
- [ ] Track documentation searches with no result where consent and hosting permit.
- [ ] Track recurring support topics and diagnostic codes in aggregate.
- [ ] Maintain a roadmap evidence register linking decisions to retained evidence.
- [ ] Define ethical retention proxies using public upgrade and continued-project
      activity only where appropriate.
- [ ] Define analytics retention, access, review, and deletion rules.
- [ ] Build a privacy-safe project-health dashboard.

### `P6-10` — Maintainer sustainability

- [ ] Define maximum supported scope and the process for declining work.
- [ ] Separate maintenance capacity from feature-development capacity.
- [ ] Automate dependency updates, release mechanics, triage, reproduction, and
      common diagnostics where safe.
- [ ] Document bus-factor and release-recovery risks.
- [ ] Inventory GitHub, npm, Maven Central, domain, DNS, signing, monitoring, and VPS
      recovery paths.
- [ ] Document hardware-backed 2FA and credential-storage requirements.
- [ ] Keep critical credentials and recovery material out of any single workstation.
- [ ] Define support expectations that do not imply continuous availability.
- [ ] Define quarterly dependency, roadmap, recovery, and burnout reviews.
- [ ] Define conditions for pausing growth activity when support quality is at risk.
- [ ] Publish funding and sponsorship principles that protect the open-source core.

Recruiting and exercising a real backup maintainer requires another trusted person
and is not included in the completable scope above.

### `P6-11` — Competitive review

- [ ] Refresh the hands-on JHipster review.
- [ ] Refresh the hands-on Hilla review.
- [ ] Refresh the hands-on Refine review.
- [ ] Refresh the hands-on react-admin review.
- [ ] Refresh the manual React/Spring baseline.
- [ ] Compare current quickstarts, ownership, generation, contracts, responsive
      defaults, offline behavior, production guidance, and upgrades.
- [ ] Preserve counterevidence and avoid universal claims from isolated failures.
- [ ] Update the public comparison page using outcome-based distinctions.
- [ ] Record features Vireo intentionally should not copy.
- [ ] Establish a twice-yearly and pre-positioning-change review cadence.

### `P6-12` — Automated launch rehearsal

- [ ] Exercise anonymous discovery, install, create, doctor, first run, generation,
      customization, verification, upgrade, deployment, demo, feedback, and
      contribution links from clean environments.
- [ ] Verify release and launch artifacts independently of workspace substitutions.
- [ ] Verify all launch content, screenshots, links, commands, and version claims.
- [ ] Rehearse demo traffic monitoring, reset, incident response, and rollback.
- [ ] Prepare accurate channel-specific launch drafts for GitHub, Java/Spring,
      React/TypeScript, PWA/offline, Hacker News, Reddit, Dev.to, and video channels.
- [ ] Define the launch-week support and incident schedule without claiming that a
      backup maintainer exists.
- [ ] Produce a launch rehearsal report and retain the HOLD decision until external
      gates pass.

### `P6-13` — Frontend-only organizational adoption

- [x] Preserve the complete React + Spring Boot project as the default profile.
- [x] Add `--profile frontend` project creation without Java, Gradle, Flyway, or
      database artifacts.
- [x] Provide mock-backed login, Item CRUD, query metadata, and history-independent
      local development.
- [x] Establish stable injectable auth, Item, history, and query adapter boundaries.
- [x] Support `vireo generate entity --target frontend`, including inferred target,
      contract check, idempotence, collision safety, and ejection.
- [x] Record target-aware wire semantics without claiming behavior for an external
      backend.
- [x] Add unit coverage and a clean generated frontend consumer job in hosted CI.
- [x] Publish architecture, team ownership, OpenAPI-wrapper, capability-limitation,
      command, public API, and website guidance.
- [x] Publish `create-vireo@0.4.0` with npm provenance and pin generated projects
      to that CLI line.

Engineering is complete in the adapter-enabled Template commit and the Starter
frontend-profile implementation. The clean consumer creates a standalone project
from the pinned public Template, installs registry dependencies, runs doctor,
generates Purchase Order twice, checks the wire contract, proves no backend files
exist, type-checks, tests, and builds. The protected publish and anonymous
post-publish verification passed on 2026-08-28. This is technical feasibility
evidence, not evidence that separate frontend/backend teams want or have adopted
the profile.

## Deferred engineering — not on the launch critical path

These items can be engineered without human evaluators, but they remain deferred
until an explicit roadmap decision admits them. Each needs its own scoped backlog,
compatibility plan, tests, documentation, and release evidence.

### Framework and generation

- [ ] Schema v2 relationships and a second compiled relational fixture.
- [ ] Compound identifier support.
- [ ] Unicode and reserved-identifier policy beyond schema v1.
- [ ] Richer field types, including explicit money semantics.
- [ ] Generated offline registration and conflict hooks.
- [ ] Capability/module generator.
- [ ] Page generator.
- [ ] Form/workflow generator.
- [ ] Settings-section generator.
- [ ] Database-migration generator.
- [ ] API-adapter generator.
- [ ] Offline replay-handler generator.
- [ ] History-entity generator.
- [ ] Localization-namespace generator.
- [ ] Standalone story/test generator.
- [ ] Framework-package generator for contributors.
- [ ] Capability enablement, disablement, removal, and orphan detection.
- [ ] Third-party capability compatibility contract.
- [ ] Extract reusable Template candidates only after the `G-207` independent-use
      condition is otherwise satisfied.

### Creation, contracts, and routing

- [ ] Evaluate and admit pnpm only if its complete support matrix is affordable.
- [ ] Add selectable authentication variants only after an explicit admission
      decision.
- [ ] Add selectable offline variants only after an explicit admission decision.
- [ ] Evaluate OpenAPI or generated clients without weakening domain models.
- [ ] Define file upload/download contracts.
- [ ] Define streaming and large-payload contracts.
- [ ] Define complete SSE wire and compatibility contracts.
- [ ] Add nested, modal, optional-parameter, and richer deep-link routing support.
- [ ] Expand page metadata for breadcrumbs, titles, analytics names, and explicit
      loading policy.

### Forms and business UI

- [ ] Asynchronous, cross-field, server, and uniqueness validation patterns.
- [ ] Multi-step workflow persistence and validation.
- [ ] Conditional fields and dynamic collections.
- [ ] Accessible relation and autocomplete fields.
- [ ] File-upload and progress patterns.
- [ ] Related-record quick creation.
- [ ] Bulk actions with confirmation and progress.
- [ ] Import/export patterns.
- [ ] Long-running job and background-operation UI.
- [ ] Notification and activity surfaces.
- [ ] Full offline queue and conflict-resolution UI.
- [ ] Visual-regression coverage for stable component and skeleton states.
- [ ] Motion and installed-app interaction policy beyond the current supported
      surface.

### PWA and offline synchronization

- [ ] Admit and implement selected optional PWA capabilities such as push,
      background sync, share target, file handling, shortcuts, badges, wake lock,
      clipboard, camera, geolocation, or storage persistence.
- [ ] Implement Template domain synchronization beyond the supported offline shell.
- [ ] Add durable replay dependencies and temporary-identifier chains.
- [ ] Add manual poison-command intervention and safe queue export.
- [ ] Add application-owned conflict resolvers and resolution history.
- [ ] Add multi-tab and multi-device convergence.
- [ ] Reconcile SSE events with optimistic and queued changes.
- [ ] Add heartbeat, resumption, missed-event reconciliation, and proxy-buffering
      behavior.
- [ ] Expand installed-app recovery for low-memory eviction and corrupt caches.

### Authentication and data capabilities

- [ ] Add optional OIDC/OAuth2 integration guidance or adapter.
- [ ] Add account recovery and forced-session invalidation patterns.
- [ ] Add explicit concurrent-session controls.
- [ ] Decide and, if admitted, implement multi-tenancy boundaries.
- [ ] Add relation filters and cycle limits to the query engine.
- [ ] Define search ranking and tokenization.
- [ ] Add parameterized saved views.
- [ ] Add a full PostgreSQL/SQLite semantic conformance suite.
- [ ] Add history retention, archival, deletion, and legal-hold hooks.
- [ ] Add history field-level redaction and exclusion hooks.
- [ ] Add audit export hooks and safe large-diff handling.
- [ ] Add pseudo-localization and long-translation testing.
- [ ] Add right-to-left structural support or a versioned deferral contract.
- [ ] Add richer pluralization and community translation tooling.

### Operations and deployment breadth

- [ ] Add one maintained managed/cloud deployment recipe.
- [ ] Add tracing integration guidance.
- [ ] Add frontend error-reporting adapter hooks.
- [ ] Add example operational dashboards and alert rules.
- [ ] Add deeper metrics for database pools and any admitted synchronization/SSE
      capabilities.
- [ ] Add zero/low-downtime guidance beyond the supported VPS path when a compatible
      deployment topology is admitted.

## Explicitly excluded human-evidence work

The following open items are intentionally not checkboxes in this execution list:

- `G-001`, `G-005`, and `G-006`: target-user, demand, and human competitor
  validation.
- `P1-01` / `G-002`: professional identity and trademark clearance.
- `P1-15`, `P2-08`, `P3-09`, and `P5-06`: unfamiliar-human onboarding and workflow
  evidence.
- `P5-07` / `G-309`: three independent active teams and one maintained deployment
  through an upgrade.
- `P4-01` / `G-301`: independent application-security review.
- `P4-03` / `G-303`: manual keyboard, assistive-technology, branded-browser, and
  physical-device evidence.
- `P4-04` / `G-304`: representative physical-device and real-user field
  performance.
- The witnessed closure row of `P4-05` / `G-305`.
- External contribution-path validation, authentic adopter examples,
  testimonials, and case-study permission.
- Recruitment and recovery exercise of a real backup maintainer.

These exclusions remain roadmap obligations. Completing every checkbox in this
document does not satisfy or waive them.
