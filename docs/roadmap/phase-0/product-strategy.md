# Phase 0 product strategy hypothesis

Status: **provisional and ready for external testing**

Baseline date: 2026-08-26

Decision owners: D-101 and D-102

This document makes the working product strategy precise enough to test. It is not
evidence that target developers agree. Public positioning remains provisional until
the [validation protocol](validation-protocol.md) meets its thresholds.

## Category statement

> Vireo Framework, by Vireo Code, is an opinionated full-stack framework for small
> teams building polished, offline-capable operational PWAs with React and Spring
> Boot.

“Opinionated” means Vireo selects and integrates one golden path for application
structure, responsive UI, data access, loading and error behavior, localization,
history, offline persistence, verification, and releases. It does not mean those
subsystems are hidden or impossible to replace.

## Primary persona

The primary persona is an intermediate-to-senior full-stack developer, or a product
team of roughly one to eight developers, responsible for shipping and maintaining
operational business software. They have chosen React and Spring Boot, value normal
source code over a proprietary application model, and own both delivery speed and
production consequences.

Typical work includes inventory, warehouse, field service, manufacturing,
accounting operations, CRM, case management, approvals, administration, and other
record- and workflow-heavy applications.

### Skill floor

The golden path may teach Vireo, but it does not teach the underlying stack. A
successful adopter should be able to:

- build and debug ordinary Java 21 and Spring Boot code;
- build React components in TypeScript and reason about hooks and async state;
- understand HTTP, JSON, authentication boundaries, and browser storage;
- write basic SQL and reason about migrations and transactions;
- use Git, npm, Gradle wrappers, browser developer tools, and automated tests.

Vireo should reduce integration work, not conceal fundamentals.

## Secondary personas

| Persona                                        | Job Vireo may serve                                                                            | Risk to validate                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Java-heavy product team                        | Add a consistent, production-shaped React frontend without designing every frontend convention | React/TypeScript skill floor may still be too high                        |
| Agency shipping repeated business applications | Reuse a coherent architecture and workflow without cloning a fragile internal starter          | Client-specific customization may pressure the support matrix             |
| Field-work product team                        | Keep selected workflows useful through intermittent connectivity and replay work safely        | Offline may be mandatory, optional, or irrelevant depending on the domain |
| Internal platform team                         | Standardize several operational apps while leaving ordinary React/Spring escape hatches        | Platform teams may demand multi-app governance beyond the initial scope   |

Secondary personas must not expand the golden path until primary-persona success is
demonstrated.

## Excluded personas

Vireo is a poor fit for:

- marketing, content, e-commerce storefront, or SEO-first websites;
- teams that have not selected both React and Spring Boot;
- teams seeking a no-code or low-code product that owns their domain model;
- native-mobile-first products whose core experience depends on native platform APIs;
- consumer social, gaming, media-streaming, or hyperscale internet workloads;
- organizations requiring a universal microservice control plane or active-active
  global data architecture from the application framework;
- teams unwilling to own domain-specific authorization, offline conflict, privacy,
  retention, and operational decisions;
- projects whose overriding priority is freedom to select any UI kit, router, data
  library, backend language, or database inside the supported golden path.

These teams may reuse an individual library, but they are not the framework's
product-design target.

## Painful job to be done

> When a small team starts or extends an operational business application, help it
> deliver a coherent production-shaped workflow without repeatedly assembling and
> debugging the React/Spring boundary, responsive business UI, async behavior,
> history, localization, offline persistence, and verification—while preserving
> normal source code and explicit domain ownership.

Supporting jobs are:

1. **Start coherently:** reach a running, understandable full-stack application
   without a private starter, weeks of integration, or hidden platform runtime.
2. **Change end to end:** add a domain workflow across migration, backend,
   authorization, API, frontend, tests, and documentation without contract drift.
3. **Operate deliberately:** make loading, errors, mobile layout, history,
   localization, reconnect, and upgrades predictable instead of incidental.
4. **Exit safely:** replace a subsystem or leave Vireo without rewriting the domain
   application from an opaque model.

## Ranked claim hierarchy

Only these three value claims may lead positioning. A claim is publishable only
after its required proof exists.

| Rank | Claim                                                                                                                                                                                           | Current readiness                                                            | Required proof before public use                                                                                                                    |
| ---: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
|    1 | **One coherent React + Spring workflow instead of recurring integration work.** Vireo should turn a domain description into understandable migration, backend, frontend, and verification code. | Directionally supported by the handwritten Item slice; generation is missing | Credential-free create flow, safe full-stack entity generation, measured time-to-first-slice, generated-contract tests, and unfamiliar-user success |
|    2 | **Operational UX is deliberately polished on desktop and mobile.** Responsive layout, forms, tables, overlays, loading, errors, accessibility, localization, and motion follow one system.      | Strongest existing evidence in Starter UI and Template contracts             | Public Storybook/demo, supported browser/device/a11y matrix, visual evidence, bundle/runtime budgets, and external usability results                |
|    3 | **Intermittent connectivity is an explicit application workflow, not a cache slogan.** Local persistence, queued work, replay, history, and conflict ownership have documented limits.          | Substantial libraries and examples; guarantees remain incomplete             | Published offline guarantees and threat model, adversarial sync/recovery tests, real-device proof, observability, and at least one field-work pilot |

“Production-shaped” is acceptable maturity language. “Production-ready,” “end-to-end
type-safe,” “offline-first for any workflow,” and quantified time savings are not
acceptable until their proof gates pass.

## One-paragraph explanation

Vireo gives small React and Spring Boot teams a coherent starting point for
operational business PWAs: ordinary application code, a deliberately polished UI
system, explicit cross-stack contracts, and building blocks for workflows that must
remain useful through unreliable connectivity. It makes a narrow set of decisions
that teams otherwise rebuild, while keeping application policy and subsystem
replacement visible. The intended outcome is faster delivery with less integration
drift—not a low-code abstraction or a replacement for React and Spring Boot.

## Message candidates to test

### A — cohesive outcome

**Ship polished operational apps without rebuilding the React/Spring foundation.**

Vireo combines one production-shaped application path with responsive business UI,
explicit contracts, offline building blocks, and verification—while leaving you
with ordinary React and Spring Boot code.

### B — intermittent-connectivity wedge

**Build business PWAs that stay useful when the network does not.**

Vireo gives React and Spring Boot teams deliberate local persistence, queued work,
replay, history, responsive UX, and explicit conflict ownership instead of an
“offline” checkbox.

### C — vertical-slice wedge

**Turn a business workflow into a coherent React + Spring vertical slice.**

Vireo is designed to generate understandable migrations, backend policy, API
contracts, frontend workflow, and tests on top of one polished operational-app
foundation.

Candidate C describes the intended Phase 3 experience and must be labeled as a
direction until the generator exists.

## Initial design envelope

These are validation and test targets, not a published support promise. The
[Phase 0D support decision](platform-support-policy.md#scale-claim-decision) keeps
every numeric capacity target provisional; Phase 4 must produce representative load,
resource, failure, and recovery evidence before any becomes a supported claim.

| Dimension                  | Initial target envelope                                                                                                                | Outside the initial target                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Product team               | 1–8 developers owning frontend and backend outcomes                                                                                    | Large multi-team platform programs as the default case                                      |
| Users                      | 10–10,000 named users; up to 500 concurrently active sessions                                                                          | Consumer internet scale or unpredictable viral traffic                                      |
| Data                       | PostgreSQL; largest operational tables up to roughly 10 million rows and database up to roughly 500 GiB, subject to query/index design | Data lake, analytics warehouse, or globally distributed OLTP                                |
| Offline device working set | Selected domain subset up to 100,000 records or 250 MiB; up to 1,000 queued mutations; disconnected periods up to seven days           | Full database replication, unlimited queues, or automatic resolution of arbitrary conflicts |
| Deployment                 | One frontend, one modular Spring Boot application, one PostgreSQL primary, and optional stateless backend replicas in one region       | Required microservice mesh or active-active multi-region writes                             |
| Tenancy                    | Single organization or modest application-owned shared tenancy                                                                         | Framework-guaranteed global multi-tenant isolation before a tenancy contract exists         |

Every numeric boundary is a falsifiable hypothesis. Exceeding it may work; Vireo
must not imply support without evidence.

## Product principles

1. **Cohesive over infinitely configurable.** One excellent path earns priority over
   a matrix of merely possible combinations.
2. **Explicit over magical.** Generated code, network boundaries, sync state, and
   application policy remain inspectable.
3. **Ordinary React and Spring code.** Vireo integrates the stack rather than
   replacing its programming models.
4. **Production-shaped defaults.** Errors, security, migrations, observability,
   verification, and upgrades enter the design early.
5. **Accessible and responsive by default.** Mobile, keyboard, assistive technology,
   loading geometry, and reduced motion are component contracts.
6. **Offline claims stay honest.** Applications own conflict and policy decisions;
   Vireo owns explicit mechanisms, diagnostics, and guarantees.
7. **Contracts over conventions alone.** Architecture, public API, wire behavior,
   generation, and loading rules receive executable checks.
8. **Escape hatches over lock-in.** Replacement boundaries and generated-code
   ownership are documented and tested.
9. **Evidence over checklist parity.** A capability must advance a target-user job
   and carry a proof plan, not merely match a competitor.
10. **Sustainable scope is a feature.** Support cost and maintainer capacity are
    product constraints.

## Terminology

Public identity follows [D-103](identity-and-coordinates.md): first references use
**Vireo Framework** and show the qualified **Vireo Code** publisher identity. That
direction remains conditional on professional clearance, domain acquisition, and
registry reservation.

| Term                       | Meaning                                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Vireo Framework**        | The complete supported product contract: packages, CLI, golden-path Template, docs, verification, and release policy |
| **Vireo Starter packages** | Independently versioned TypeScript and JVM libraries consumed by applications                                        |
| **Vireo Template**         | The minimal generated or cloned golden-path application proving package composition                                  |
| **Vireo CLI**              | The future create, doctor, generate, and upgrade lifecycle interface                                                 |
| **Vireo examples**         | Capability demonstrations and recipes outside the minimal Template                                                   |
| **Application policy**     | Domain-specific decisions the adopter owns, including authorization, conflicts, retention, and product UX            |

## Capability admission test

A new framework capability must identify the primary-persona job it advances, the
product principle it follows, its owner and replacement boundary, its supported
matrix cost, its security/accessibility/offline implications, and the evidence that
will prove value. “A competitor has it” is never sufficient.
