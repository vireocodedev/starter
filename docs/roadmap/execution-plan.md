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
   replaced by maintainer intuition or automated tests.
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

| Milestone | Scope                                                  | Exit evidence                                                                     | Status   |
| --------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- | -------- |
| Phase 0A  | Repository baseline reconciliation                     | Scorecard, gap register, responsibility map, prerequisite inventory, measurements | Complete |
| Phase 0B  | Audience, positioning, non-goals, and scope            | Decision record plus target-developer validation plan                             | Complete |
| Phase 0C  | Identity, package coordinates, and repository topology | Approved naming and topology decisions                                            | Complete |
| Phase 0D  | Supported platform matrix                              | Published toolchain, browser, database, and OS policy                             | Next     |
| Phase 0E  | External evidence                                      | Interviews and observed clean-room onboarding                                     | Pending  |
| Phase 0F  | Phase 0 gate review                                    | Dated Phase 1 backlog with reliable estimates                                     | Pending  |
| Phase 1   | Public foundation and trust                            | Credential-free public adoption and clean-install proof                           | Pending  |
| Phase 2   | Golden-path developer experience                       | Create/doctor workflow and independently successful onboarding                    | Pending  |
| Phase 3   | Killer vertical-slice workflow                         | Generated full-stack capability proven by external users                          | Pending  |
| Phase 4   | Production hardening                                   | Published production-readiness criteria pass                                      | Pending  |
| Phase 5   | Flagship experience and public beta                    | Three independent active teams and one deployment                                 | Pending  |
| Phase 6   | Launch and sustained growth                            | Organic activation, sustainable support, and reliable upgrades                    | Pending  |

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

Phase 0C approves the internal direction and migration contract. External identity
activation remains blocked on professional clearance, domain acquisition, and
registry reservation; repository and source-coordinate changes are deliberately
deferred to the coordinated Phase 1 migration.

## Measurement policy

Measurements record the commit, machine, toolchain, cache state, command, and
limitations. A local result outside the supported toolchain is diagnostic evidence,
not supported-platform proof. Performance numbers are baselines, not promises or
budgets, until the support matrix and CI measurement policy are approved.

## Next milestone: Phase 0D

Phase 0D should produce:

1. An explicit support matrix for Node, npm, Java, Spring Boot, React, MUI,
   PostgreSQL, Gradle, operating systems, and browsers.
2. Version-window, end-of-life, deprecation, and emergency-drop policies.
3. CI and clean-room proof obligations for every supported combination.
4. Unambiguous `supported`, `compatible`, `experimental`, and `untested` labels.
5. A decision on which parts of the provisional scale envelope become supported
   claims and which remain Phase 4 validation targets.

The Phase 0B audience and claim hierarchy remain hypotheses until Phase 0E executes
the validation protocol. Completing internal identity and topology decisions does
not authorize domain purchases, public renames, or package publication before the
activation prerequisites in the identity decision pass.
