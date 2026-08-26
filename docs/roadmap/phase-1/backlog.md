# Phase 1 dependency-ordered backlog

Prepared: 2026-08-26

Status: **provisional; planning is allowed, implementation is not authorized until
the Phase 0 gate passes**

This backlog converts G-007 and G-101–G-112 into reviewable public-foundation work.
It is intentionally narrower than the complete master roadmap: create/doctor,
full-stack generation, production-hardening, flagship-demo, and growth work remain
in later phases.

## Estimation contract

- Estimates are remaining **active engineer-days**, not elapsed calendar days.
- Ranges include implementation, tests, documentation, review, and clean-consumer
  verification for the stated item.
- External legal review, DNS/registry/account verification, publishing queues, and
  participant scheduling are recorded separately as wait time.
- Confidence is `high` when the current implementation and acceptance path are
  understood, `medium` when one bounded choice remains, and `low` when a spike or
  external system can materially change the solution.
- Estimates assume a contributor familiar with the repositories. First-time
  contributors require onboarding capacity.
- Re-estimate after D-106, after Phase 0E findings are triaged, and after the first
  two completed Phase 1 items establish observed throughput.

The current sum is **57–104 active engineer-days**, before contingency. Summing is
useful for capacity planning but does not imply all work is sequential.

## Backlog

| ID    | Outcome                                                                                     | Gaps/decisions             | Depends on                               | Estimate                     | Confidence |
| ----- | ------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------- | ---------------------------- | ---------- |
| P1-00 | Freeze the passed Phase 0 scope and Phase 1 acceptance set                                  | D-101, D-102               | Phase 0 gate                             | 1–2 d                        | High       |
| P1-01 | Activate the cleared, pre-reserved identity across canonical public surfaces                | G-002, D-103               | Phase 0 gate; account access             | 2–5 d active + external wait | Low        |
| P1-02 | Productionize the accepted npm/Maven distribution and provenance architecture               | D-106, G-103               | Phase 0 gate; accepted D-106             | 2–4 d                        | Medium     |
| P1-03 | Freeze the coordinate/repository migration and compatibility sequence                       | D-104, G-104, G-111        | P1-01, P1-02                             | 3–5 d                        | Medium     |
| P1-04 | Publish credential-free npm artifacts through the selected trusted path                     | G-007, G-103, G-111        | P1-02, P1-03                             | 4–7 d                        | Medium     |
| P1-05 | Publish credential-free Maven artifacts/BOM through the selected trusted path               | G-007, G-103, G-111        | P1-02, P1-03                             | 5–9 d                        | Low        |
| P1-06 | Activate canonical repositories, redirects, metadata, topics, and public settings           | G-101, G-111               | P1-01, P1-03                             | 2–4 d                        | Medium     |
| P1-07 | Publish governance, support, ownership, issue intake, and response boundaries               | G-102                      | P1-06 naming/links                       | 3–5 d                        | High       |
| P1-08 | Publish artifact compatibility, semver, deprecation, release-line, and migration policy     | G-104                      | P1-02, P1-03                             | 4–7 d                        | Medium     |
| P1-09 | Enforce least privilege, pinned automation, scanning, SBOM/provenance, and release recovery | G-103, G-107               | P1-02; public CI/release targets         | 5–9 d                        | Low        |
| P1-10 | Correct known documentation drift and automate checkable version/link/setup claims          | G-105, G-106               | P1-03 coordinates; P1-08 policy          | 4–7 d                        | Medium     |
| P1-11 | Publish the minimal docs/README evaluation funnel and API entry points                      | G-101, G-110               | P1-06, P1-07, P1-08, P1-10               | 5–9 d                        | Low        |
| P1-12 | Encode the admitted platform matrix and required clean-room consumer lanes                  | G-112                      | P1-04, P1-05, P1-08, P1-09               | 7–12 d                       | Low        |
| P1-13 | Classify and document the supported Starter UI public surface                               | G-109                      | P1-08 policy                             | 4–8 d                        | Low        |
| P1-14 | Establish verification duration/resource baselines and regression policy                    | G-108                      | Stable Phase 1 CI shape from P1-09/P1-12 | 2–4 d                        | Medium     |
| P1-15 | Run the credential-free public-alpha consumer and unfamiliar-user gate                      | G-007, G-106; Phase 1 gate | P1-04 through P1-14                      | 4–7 d                        | Low        |

## Dependency waves

### Wave 0 — Phase 0 closure

- Complete external research and accept/revise/reject D-101 and D-102.
- Clear/reserve identity inputs and prove D-106 publication options.
- Pass the [Phase 0 gate](../phase-0/phase-0-gate-review.md).

No public rename, package-coordinate migration, or support claim begins before this
wave passes.

### Wave 1 — Lock public contracts

- P1-00 through P1-03.
- P1-07 and P1-08 may draft in parallel once canonical links and release targets are
  stable.

Exit: identity, repository, distribution, compatibility, governance, and rollback
contracts are reviewable before irreversible publication.

### Wave 2 — Publish and harden

- P1-04 through P1-10.
- npm and Maven work may proceed in parallel after the shared publication contract
  is frozen.
- Security/provenance work ships with the first public release, not as a later
  cosmetic retrofit.

Exit: public source and artifacts are credential-free, traceable, governed, and
documented under the selected coordinates.

### Wave 3 — Make the promise enforceable

- P1-11 through P1-14.
- Every advertised support row needs a required evidence lane or an explicit
  experimental/best-effort label.

Exit: discovery, compatibility, UI surface, documentation, and CI claims agree.

### Wave 4 — Independent public-alpha proof

- P1-15.
- Use a clean account and clean supported environments, then an unfamiliar evaluator.
- Record every credential prompt, rescue, documentation ambiguity, unsupported
  assumption, and failed provenance/compatibility check.

Exit: a stranger can inspect, install, verify, and legally adopt Vireo without
maintainer intervention.

## Item acceptance contracts

### P1-01 — Identity activation

- the gate's professional-clearance, ownership, reservation, and fallback evidence
  is still current before activation;
- selected domain and publisher/repository/package profiles are configured with
  recovery access and hardware-backed MFA where offered;
- canonical naming is activated consistently across the approved public surfaces;
- no source coordinate changes occur until P1-03 approves the migration sequence;
- public wording remains qualified as **Vireo Framework by Vireo Code**.

### P1-02 — Distribution productionization

- reproduce the accepted Phase 0 spikes under production account ownership;
- configure the selected npm and Maven destinations, source linkage, signing,
  checksum/provenance behavior, revocation, and recovery;
- implement and test the accepted least-privilege publishing identity without
  publishing canonical artifacts before P1-03 freezes the migration sequence;
- confirm costs, availability, retention, and version-immutability assumptions are
  unchanged; and
- keep implementation aligned with D-106's selected option, rejected options,
  reversal cost, and evidence.

### P1-03 through P1-06 — Coordinated public migration

- one mapping covers repository names, npm names, Maven coordinates, imports,
  examples, documentation, automation, issue links, and release history;
- old names are reserved, redirected, or deprecated according to policy;
- dry runs prove published-consumer compatibility before the switch;
- rollback checkpoints exist before each irreversible external mutation;
- public metadata never points at unavailable docs, artifacts, or repositories.

### P1-07 through P1-10 — Trust contracts

- support and governance language matches actual maintainer capacity;
- security reporting is private, monitored, and recoverable by more than one trusted
  account before public promotion;
- release automation has explicit permissions, pinned trusted dependencies, and a
  documented recovery route;
- compatibility/deprecation language covers TypeScript, CSS/UI behavior, JVM APIs,
  configuration, schemas/migrations, generated code, peer floors, and Template
  version pairings;
- checkable documentation facts fail CI when they drift.

### P1-11 through P1-14 — Enforced public promise

- README and docs answer what Vireo is, who it is for, maturity, prerequisites,
  limitations, first success, architecture, and where to go next;
- supported matrices are machine-readable enough to drive manifests, documentation,
  and required CI lanes from one reviewed policy;
- Starter UI exports are classified as supported, advanced, internal/deprecated, or
  pending decision without silently breaking consumers;
- verification budgets state host class, cache state, statistical method, warning
  threshold, failure threshold, and exception process.

### P1-15 — Public-alpha gate

- public clone and package resolution require no organization membership or token;
- clean npm and Maven consumers verify the published boundary and provenance;
- the canonical Template starts on each required clean-room class admitted for
  public alpha;
- one unfamiliar evaluator completes inspect/install/verify without rescue, or the
  gate remains open and every blocker returns to this backlog;
- legal/license, security, support, compatibility, and known-limitations links are
  visible at the adoption decision points.

## Scheduling rule

At the passed Phase 0 gate, assign named owners and weekly capacity, then compute a
critical path from the dependencies above. Report engineering effort and external
wait time separately. Use the first two completed items to replace planning ranges
with observed throughput; do not announce an elapsed launch date before that
reforecast.
