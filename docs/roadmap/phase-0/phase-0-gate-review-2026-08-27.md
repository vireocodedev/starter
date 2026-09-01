# Phase 0 AI-proxy closure review

Review date: 2026-08-27

Decision authority: repository owner's explicit D-110 variance

Status: **CONDITIONAL GO — Phase 0 AI proxy passed; live target-developer
validation deferred to public beta as an accepted risk.**

This is a new review. It does not edit or reinterpret the historical
[2026-08-26 NO-GO](phase-0-gate-review.md). The original gate correctly failed on
the evidence available then. Public source/artifact activation and the explicitly
authorized evidence variance now permit Phase 1 to proceed without pretending the
original human-demand threshold passed.

## Gate decision

Phase 0 closes under D-110's narrow variance. Phase 1 is the exact next authorized
roadmap phase.

No live unfamiliar-human validation was performed. AI evaluators supplied proxy
evidence for message comprehension, documentation quality, public accessibility,
technical onboarding, positioning plausibility, and feasibility. They supplied no
demand, project-intent, adoption, willingness-to-pay, production-use, star-growth,
or product-market-fit evidence.

## AI-proxy acceptance review

| #   | Criterion                                                                                                                         | Result                  | Evidence and disposition                                                                                                                                                                                                                                                                                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Public npm and Maven resolve without private credentials                                                                          | Pass                    | Seven npm `0.2.1` packages passed anonymous cold install plus signature/provenance verification; six Maven Central `0.2.0` modules passed a fresh Gradle consumer.                                                                                                                                                                                                    |
| 2   | Public Template consumes registry artifacts, not local workspaces                                                                 | Pass                    | Frozen public Template `ee5ecd251fa30655133e833b93de681bf2171c5c` used six npm `^0.2.1` packages and the Maven BOM/modules at `0.2.0`; no substitution or private destination was active.                                                                                                                                                                             |
| 3   | At least four of five final blind messages score at least 8/10, with category and ownership nonzero                               | Pass                    | Five fresh isolated evaluators scored the revised candidate A `10/10`; initial A/B/C counterevidence is retained rather than discarded.                                                                                                                                                                                                                               |
| 4   | Fresh evaluator finds the public start and runs the app without rescue                                                            | Pass                    | Public clone, empty-cache npm install, frontend, H2 backend, login, and Item browser lifecycle passed by about 7m12s. Sandbox bind and transient port failures stood for three minutes; no Vireo hint or rescue was given.                                                                                                                                            |
| 5   | No undisclosed identity/distribution blocker                                                                                      | Pass                    | Public repositories, npm scope, provenance, Maven namespace/signing, and anonymous consumers are evidenced. Professional clearance is disclosed as G-002 and accepted before 1.0/material brand investment, not hidden.                                                                                                                                               |
| 6   | Public documentation does not materially misrepresent ownership, offline, maturity, generation, security, or production readiness | Pass at closure commits | Copy now says app-owned policy, manual Template ports, `0.x`, “production-shaped,” opt-in offline primitives, and no create/doctor/full-stack generator. The false “Offline-first CRUD” label is now a disclosed local state simulation. Changes are local and unpushed by instruction; owner publication is required before relying on the corrected public wording. |
| 7   | Every blocker/major finding is fixed, accepted, or registered with owner/phase                                                    | Pass                    | Offline/localization contradictions were fixed; temporal package setup now has a packed-consumer regression check and Template guard; human/identity/competitor risks are accepted under D-110; repository metadata, executable temporal docs, and broader security/platform gaps remain assigned to Phase 1 or later.                                                |
| 8   | D-101 and D-102 can be provisionally resolved                                                                                     | Pass                    | D-101 selects small React/Spring teams building operational apps; D-102 selects revised cohesive candidate A with narrowed ownership/offline/generation/maturity claims. Both explicitly remain non-market-validated.                                                                                                                                                 |
| 9   | Human demand validation is explicitly deferred                                                                                    | Pass                    | D-110, G-001/G-005/G-006, retained human protocols, execution plan, backlog, master roadmap, and this review all prohibit treating AI evidence as human validation. Revisit after three independent adopters or before 1.0.                                                                                                                                           |
| 10  | Phase 1 backlog reflects current public reality                                                                                   | Pass                    | Completed npm/Maven/public-coordinate items are closed, partial work is separated, external metadata is recorded, and remaining planning scope is 37–71 active engineer-days rather than the obsolete prepublication total.                                                                                                                                           |

The underlying commands, timings, blind scores, onboarding/change evidence,
competitor counterevidence, rescues, remediation, and limitations are in the
[AI-proxy evaluation record](evidence/2026-08-27-ai-proxy-evaluation.md).

## Provisional Phase 0 decisions

- **D-101 — provisionally accepted, not market-validated.** Target small teams
  already choosing React and Spring Boot for operational business applications.
  Teams own domain rules, authorization policy, conflict resolution, and product
  code. Excluded audiences and the documented skill floor remain active.
- **D-102 — provisionally accepted, not market-validated.** Lead with the revised
  cohesive React/Spring foundation message. Responsive/loading/error discipline
  and app-owned composition are the strongest current proof. Offline is opt-in
  primitives, generation is future work, and maturity is “production-shaped.”
- **D-106 — activated.** Canonical public npm and Maven destinations, provenance/
  signing, and anonymous consumers pass.

## Findings and accepted risks

### Fixed during closure

- Stale GitHub Packages, private-repository, prerelease, credential, and artifact
  version language was reconciled with active public distribution.
- README and Template documentation now state the product category, audience,
  `0.x` maturity, application ownership, public prerequisites, and precise offline
  boundary.
- The Template's misleading offline page is now explicitly a local state
  simulation; session and page strings are localized and Croatian Day.js data is
  loaded.
- The UI package preserves its Day.js UTC/locale setup through consumer tree
  shaking, documents canonical seconds, and verifies the packed bundle. The
  Template also initializes UTC explicitly for currently published `0.2.x`.

### Accepted or deferred

- G-001/G-006: zero human demand/onboarding sessions; human-only post-beta obligation under D-110 timing.
- G-002: professional identity clearance before material brand investment or 1.0.
- G-005: controlled neutral-fixture and human competitor replication before
  comparative claims or 1.0.
- G-101: external GitHub description/homepage/topics/discussion/template metadata.
- G-106: comprehensive executable docs, including clearer temporal-value examples.
- G-107/G-112: full scanning/SBOM/recovery and admitted hosted platform evidence.
- G-302: published offline guarantees and an end-to-end integrated example in
  Phase 4; current architecture does not imply arbitrary offline synchronization.
- G-308/G-309: hosted flagship, uptime contract, and independent adopters in
  Phase 5.

The clean Inspection probe also measured more than 1,050 handwritten lines across
24 new core/test files and registries. That evidence supports Phase 3 generator
work; it does not make the current product explanation dishonest because generation
is explicitly absent from the current promise.

## Phase 1 authorization and forecast

The [current backlog](../phase-1/backlog.md) authorizes Phase 1 public-foundation
work. The planning remainder is 37–71 active engineer-days plus external wait, not
an elapsed launch promise. Named owners/capacity and two observed remaining-item
throughput samples are still required before a schedule can be called reliable.

Start with accurate external repository metadata, governance/support and
compatibility contracts, then executable docs, security/SBOM/recovery, platform
evidence, public docs/API discovery, UI-surface classification, and the complete
public-alpha unfamiliar-user gate. Do not start Phase 2 create/doctor or Phase 3
generation merely because their absence was observed during Phase 0.

## Closure statement

**CONDITIONAL GO — Phase 0 AI proxy passed; live target-developer validation
deferred to public beta as an accepted risk.**

This decision must be reopened if the owner declines to publish the remediation
commits, anonymous package verification regresses, a hidden identity/distribution
constraint appears, or human evidence later contradicts the provisional audience
or positioning.
