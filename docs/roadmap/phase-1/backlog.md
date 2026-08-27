# Phase 1 dependency-ordered backlog

Prepared: 2026-08-26

Status: **authorized by the 2026-08-27 conditional Phase 0 gate; public
distribution work is already partly complete**

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
- Re-estimate after the first two remaining items establish observed throughput and
  named owner capacity is known.

The original plan totaled **57–104 active engineer-days**. After public activation
and the 2026-08-27 closure work, the planning remainder is **37–71 active
engineer-days**, before contingency or external wait. This is a scope range, not an
elapsed-date commitment.

## Backlog

| ID    | Outcome                                                                                 | Current state | Remaining estimate    | Confidence |
| ----- | --------------------------------------------------------------------------------------- | ------------- | --------------------- | ---------- |
| P1-00 | Freeze the passed Phase 0 scope and Phase 1 acceptance set                              | Complete      | 0 d                   | High       |
| P1-01 | Activate and professionally clear the identity across canonical public surfaces         | Partial       | 1–3 d + external wait | Low        |
| P1-02 | Productionize the accepted npm/Maven distribution and provenance architecture           | Complete      | 0 d                   | High       |
| P1-03 | Finish repository migration and publish compatibility sequencing                        | Partial       | 2–4 d                 | Medium     |
| P1-04 | Publish credential-free npm artifacts through the selected trusted path                 | Complete      | 0 d                   | High       |
| P1-05 | Publish credential-free Maven artifacts/BOM through the selected trusted path           | Complete      | 0 d                   | High       |
| P1-06 | Correct repository metadata, topics, links, and public settings                         | Partial       | 1–2 d                 | High       |
| P1-07 | Publish governance, support, ownership, issue intake, and response boundaries           | Pending       | 3–5 d                 | High       |
| P1-08 | Publish artifact compatibility, semver, deprecation, release-line, and migration policy | Pending       | 4–7 d                 | Medium     |
| P1-09 | Complete scanning, SBOM/provenance policy, and release-recovery evidence                | Partial       | 3–6 d                 | Low        |
| P1-10 | Extend executable checks for version, link, setup, and deployment claims                | Partial       | 2–5 d                 | Medium     |
| P1-11 | Publish the minimal docs/README evaluation funnel and API entry points                  | Pending       | 5–9 d                 | Low        |
| P1-12 | Encode the admitted platform matrix and required clean-room consumer lanes              | Partial       | 7–12 d                | Low        |
| P1-13 | Classify and document the supported Starter UI public surface                           | Pending       | 4–8 d                 | Low        |
| P1-14 | Establish verification duration/resource baselines and regression policy                | Partial       | 2–4 d                 | Medium     |
| P1-15 | Complete the credential-free public-alpha consumer and unfamiliar-user gate             | Partial       | 3–6 d                 | Low        |

## Implementation status — 2026-08-27

- **P1-02, P1-04, and P1-05: complete.** Seven public npm packages expose
  provenance and six signed Maven modules pass anonymous cold-consumer checks.
- **P1-03 (package-coordinate portion): implemented.** Coordinates are
  `com.vireocode:vireo-{bom,core,auth,query,history,offline}` and public Java APIs
  live beneath `com.vireocode.vireo.*`; the Template and all JVM fixtures consume
  them together. The approved repository rename/compatibility sequence remains.
- **P1-06: partial.** Both repositories are publicly readable. The Starter's
  externally hosted description is stale and homepage/topics/discussions/template
  settings remain incomplete; these cannot be corrected by a local-only commit.
- **P1-09: partial.** Workflow permissions are least-privilege, actions are pinned,
  signing is protected, and npm/Maven provenance exists. Complete scanning, SBOM
  policy, and recovery evidence remain.
- **P1-10: partial.** The known Phase 0 documentation drift is fixed, including the
  Template's formerly misleading offline simulation label. The packed UI test now
  protects temporal initialization and canonical seconds are documented, but the
  clean probe shows public application examples and comprehensive executable
  documentation still remain G-106.
- **P1-15: partial.** Anonymous artifact consumers and one isolated AI clean-room
  Template evaluation exist. The full admitted environment matrix and the human
  public-alpha adoption decision still remain.

## Dependency waves

### Wave 0 — Phase 0 closure (complete)

- Provisionally accept D-101/D-102 under the explicit D-110 AI-proxy variance.
- Activate public repositories and npm/Maven distribution.
- Record the [conditional Phase 0 gate](../phase-0/phase-0-gate-review-2026-08-27.md).

Human demand validation remains deferred; it is not silently converted into Phase 0
completion evidence.

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

At the conditional Phase 0 gate, assign named owners and weekly capacity, then compute a
critical path from the dependencies above. Report engineering effort and external
wait time separately. Use the first two completed items to replace planning ranges
with observed throughput; do not announce an elapsed launch date before that
reforecast.
