# Vireo roadmap execution plan

This directory turns the
[`VIREO_THOUSANDS_OF_STARS_MASTER_ROADMAP.md`](../../VIREO_THOUSANDS_OF_STARS_MASTER_ROADMAP.md)
strategy into evidence-backed execution. The master roadmap remains the source of
strategic intent. These documents record current evidence, decisions, sequencing,
and completion.

## Operating rules

1. Work proceeds through the roadmap phases and their exit gates, not by choosing
   isolated checkboxes.
2. Every status claim links to code, tests, documentation, a reproducible command,
   or external research evidence.
3. `Done` means the roadmap's definition of done is satisfied. Existing code alone
   is not enough.
4. Human-validation work such as interviews and observed onboarding is never
   replaced or described as complete from maintainer intuition, automation, or AI.
   D-110 permits a one-time Phase 0 sequencing variance while retaining that work
   as an explicit public-beta risk.
5. Each focused milestone receives its own reviewable commit.
6. The master roadmap is not mechanically checked off. Phase reviews update it only
   after the relevant exit gate is met.
7. Findings that cross repositories are recorded once here and link to the owning
   repository.

## Status vocabulary

| Status             | Meaning                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| `Done`             | Requirement and definition of done are evidenced.                                                 |
| `Partial`          | Useful implementation exists, but one or more contract, proof, or adoption requirements remain.   |
| `Missing`          | No meaningful implementation or evidence exists.                                                  |
| `Blocked`          | Completion requires a named external decision, credential, person, or platform change.            |
| `Needs validation` | A working hypothesis exists but has not been tested with the target audience or supported matrix. |

## Execution sequence

| Milestone | Scope                                                  | Exit evidence                                                                     | Status                 |
| --------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- | ---------------------- |
| Phase 0A  | Repository baseline reconciliation                     | Scorecard, gap register, responsibility map, prerequisite inventory, measurements | Complete               |
| Phase 0B  | Audience, positioning, non-goals, and scope            | Decision record plus target-developer validation plan                             | Complete               |
| Phase 0C  | Identity, package coordinates, and repository topology | Approved naming and topology decisions                                            | Complete               |
| Phase 0D  | Supported platform matrix                              | Published toolchain, browser, database, and OS policy                             | Complete               |
| Phase 0E  | External evidence                                      | Isolated AI proxy; human research explicitly deferred under D-110                 | Complete with variance |
| Phase 0F  | Phase 0 gate review                                    | Dated closure review and current Phase 1 backlog                                  | Complete               |
| Phase 1   | Public foundation and trust                            | Credential-free public adoption and clean-install proof                           | In progress            |
| Phase 2   | Golden-path developer experience                       | Create/doctor workflow and independently successful onboarding                    | Pending                |
| Phase 3   | Killer vertical-slice workflow                         | Generated full-stack capability proven by external users                          | Pending                |
| Phase 4   | Production hardening                                   | Published production-readiness criteria pass                                      | Pending                |
| Phase 5   | Flagship experience and public beta                    | Three independent active teams and one deployment                                 | Pending                |
| Phase 6   | Launch and sustained growth                            | Organic activation, sustainable support, and reliable upgrades                    | Pending                |

## Phase 0A evidence set

- [Baseline scorecard](phase-0/baseline-scorecard.md)
- [Prioritized gap register](phase-0/gap-register.md)
- [Template responsibility map](phase-0/template-responsibility-map.md)
- [Prerequisites and credentials](phase-0/prerequisites-and-credentials.md)
- [Decision queue](phase-0/decisions.md)

## Phase 0B evidence set

- [Product strategy hypothesis](phase-0/product-strategy.md)
- [Competitive gap matrix](phase-0/competitive-gap-matrix.md)
- [Audience and positioning validation protocol](phase-0/validation-protocol.md)
- [Updated decision queue](phase-0/decisions.md)

## Phase 0C evidence set

- [Identity and package-coordinate decision](phase-0/identity-and-coordinates.md)
- [Canonical repository-topology ADR](phase-0/repository-topology.md)
- [Resolved decisions D-103 and D-104](phase-0/decisions.md)
- [Updated baseline](phase-0/baseline-scorecard.md)
- [Updated gap register](phase-0/gap-register.md)

Phase 0C approved the direction and migration contract. Since that decision,
`vireocode.com`, both public repositories, the npm scope, and the verified Maven
namespace have been activated. Professional clearance and the remaining repository
rename/metadata sequence stay in Phase 1.

## Phase 0D evidence set

- [Platform support and lifecycle policy](phase-0/platform-support-policy.md)
- [Resolved decision D-105](phase-0/decisions.md)
- [Updated prerequisites baseline](phase-0/prerequisites-and-credentials.md)
- [Updated baseline](phase-0/baseline-scorecard.md)
- [Updated gap register](phase-0/gap-register.md)

Phase 0D defines the intended public contract and the evidence required to activate
each supported row. It does not relabel currently untested combinations as
supported. Matrix automation, cross-platform clean rooms, real PostgreSQL lanes,
cross-browser coverage, and device/PWA evidence remain Phase 1–4 execution work.

## Phase 0E fieldwork launch set

- [Audience and positioning validation protocol](phase-0/validation-protocol.md)
- [Recruitment, consent, and fieldwork operations](phase-0/research-operations.md)
- [Hands-on competitor benchmark protocol](phase-0/competitor-benchmark-protocol.md)
- [Aggregate research evidence rules and checkpoint template](research/README.md)

Phase 0E closes only under D-110's owner-approved variance. Six initial blind
message evaluations, five fresh final-message evaluations, one isolated public
clean-room onboarding run, and one adversarial competitor review provide an AI
proxy for comprehension and technical feasibility. Zero humans were recruited or
observed, so D-101 and D-102 are provisional and the retained human protocols remain
public-beta work. See the [AI-proxy evidence report](phase-0/evidence/2026-08-27-ai-proxy-evaluation.md).

## Phase 0F gate-preparation set

- [Historical 2026-08-26 gate review](phase-0/phase-0-gate-review.md)
- [2026-08-27 closure review](phase-0/phase-0-gate-review-2026-08-27.md)
- [Dependency-ordered Phase 1 backlog](phase-1/backlog.md)
- [Updated decision queue](phase-0/decisions.md)
- [Updated gap register](phase-0/gap-register.md)

The first formal review remains an immutable **NO-GO** record. The 2026-08-27 rerun
records **CONDITIONAL GO — Phase 0 AI proxy passed; live target-developer validation
deferred to public beta as an accepted risk.** Public npm/Maven artifacts and both
repositories are anonymously consumable. Phase 1 is therefore the next authorized
phase; no elapsed forecast is promised until owners, capacity, and observed
throughput are known.

## Measurement policy

Measurements record the commit, machine, toolchain, cache state, command, and
limitations. A local result outside the supported toolchain is diagnostic evidence,
not supported-platform proof. Performance numbers are baselines, not promises or
budgets, until the support matrix and CI measurement policy are approved.

## Deferred human-validation milestone

Public-beta validation must still produce:

1. Recruit the participant cohorts in the validation protocol and run the first
   five-session checkpoint before treating the strategy as validated.
2. Run randomized problem interviews and blind message-comprehension tests for the
   three candidate claims.
3. Execute equivalent hands-on competitor scenarios and record outcome, friction,
   maintenance, and lock-in evidence.
4. Observe current Template setup and first-change sessions, preserving the public
   artifact boundary and labeling missing generation as a known constraint rather
   than hiding it.
5. Publish anonymized findings and accept, revise, or reject D-101 and D-102 without
   committing participant identities or confidential raw research.

The Phase 0B audience and claim hierarchy are provisionally accepted, not
market-validated. The Phase 0D matrix also remains inactive as a public support
claim until each enforcement row passes. Repository visibility, distribution, and
AI-proxy onboarding are technical evidence; none demonstrates audience demand,
project intent, or product-market fit.
