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
| Phase 0B  | Audience, positioning, non-goals, and scope            | Decision record plus target-developer validation plan                             | Next     |
| Phase 0C  | Identity, package coordinates, and repository topology | Approved naming and topology decisions                                            | Pending  |
| Phase 0D  | Supported platform matrix                              | Published toolchain, browser, database, and OS policy                             | Pending  |
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

## Measurement policy

Measurements record the commit, machine, toolchain, cache state, command, and
limitations. A local result outside the supported toolchain is diagnostic evidence,
not supported-platform proof. Performance numbers are baselines, not promises or
budgets, until the support matrix and CI measurement policy are approved.

## Next milestone: Phase 0B

Phase 0B should produce:

1. A precise primary persona and excluded personas.
2. The painful job Vireo is hired to perform.
3. Three ranked product claims, each paired with required proof.
4. Explicit non-goals and supported scale boundaries.
5. Three candidate positioning messages for external testing.
6. An interview script and participant criteria for Phase 0E.

The working hypothesis is a small full-stack team building operational business
software with React and Spring Boot, where responsive polish and intermittent
connectivity materially affect the product. It remains a hypothesis until tested.
