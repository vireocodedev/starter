# Phase 4 closure review — 2026-08-28

## Decision

The maintainer-automatable Phase 4 engineering scope is complete. The production-
readiness gate remains **open**: Vireo does not yet claim public-beta production
readiness or WCAG conformance. Phase 5 engineering may proceed in parallel, but a
release cannot convert the open rows below into passing claims without the named
external/manual evidence.

## Implemented evidence

| Work item         | Implemented contract and evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `P4-00`           | Baseline, evidence classes, non-substitutable rows, and this dated gate review are public.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `P4-01` / `G-301` | Template threat model, hardening guide, remediation SLA, production error/cookie/header defaults, auth/CSRF/session-fixation/redaction tests, CodeQL, dependency review/audit, Gitleaks, SBOM and provenance.                                                                                                                                                                                                                                                                                                              |
| `P4-02` / `G-302` | Public offline-guarantees contract plus adversarial duplicate-ID, malformed-replay, deterministic-ordering, owner-transition, hydration, lifecycle and recovery tests. Template explicitly supports an offline shell, not offline domain synchronization.                                                                                                                                                                                                                                                                  |
| `P4-03` / `G-303` | WCAG 2.2 AA target, blocking Storybook and full-stack axe flows, corrected labels/landmarks/navigation semantics, Chromium plus recurring Firefox/WebKit-engine coverage, production PWA registration/update/offline-shell/API NetworkOnly tests, and a manual evidence matrix.                                                                                                                                                                                                                                            |
| `P4-04` / `G-304` | Production bundle and verification duration/RSS budgets plus Lighthouse performance, accessibility, best-practice, FCP, LCP, TBT and CLS thresholds with retained evidence.                                                                                                                                                                                                                                                                                                                                                |
| `P4-05` / `G-305` | Guarded logical backup and new-database-only restore helpers; digest-pinned PostgreSQL 17→18 backup/restore/data/Flyway/production-readiness rehearsal; graceful shutdown; request-ID correlation; operations, observability, deployment, rollback, database and incident runbooks. The [2026-09-01 maintainer rehearsal](evidence/target-recovery-2026-09-01.md) adds hosted backup/restore/application acceptance and a sanitized isolated SEV-3 immutable-recreation recovery result; independent witness remains open. |
| `P4-06` / `G-203` | `vireo upgrade` 0.2.0→0.3.0 policy with default dry run, explicit apply/ownership acknowledgement, atomic managed writes, rollback guidance, and refusals for unknown sources, dependency/lock drift, migration conflicts, generated/wire drift and upgrade-record collisions. A full release-pair fixture generates an entity and passes frontend type/wire and backend Flyway/API tests.                                                                                                                                 |

Concentrated implementation commits are `1658022`, `fe25cd3`, `6458313`,
`53bae10`, and `20e3318` in Starter, and `4b7827a`, `9e94824`, `89f782f`,
`8b1fe82`, `a7b549c`, `cc13fb7`, `37b6f1b`, `a065762`, `5860614`, and
`dd9c254` in Template.

## Reproducible local results

The following passed on 2026-08-28:

- 73 SQLite tests plus Starter type/documentation policies;
- Template security/request-correlation backend tests and the full backend suite;
- four full-stack axe flows and two production-PWA flows;
- Lighthouse budgets (performance 0.79, accessibility 1.00, best practices 0.96,
  FCP 3.45 s, LCP 4.22 s, TBT 42.5 ms, CLS 0);
- PostgreSQL 17→18 logical recovery preserving 4 Items, 2 users and 3 Flyway
  migrations, followed by production-profile readiness;
- `create-vireo` project-upgrade unit/refusal/idempotence tests, the full 0.2.0→0.3.0
  generated-project fixture, public contract/API/surface policy, and isolated packed
  release smoke.

The release activation completed on 2026-08-28: `create-vireo` 0.3.0 and
`@vireocodedev/sqlite` 0.2.2 were published through the protected OIDC workflow,
the anonymous public-consumer verification passed, signed SBOM attestations were
verified, and the hosted 0.2.0→0.3.0 project-upgrade fixture passed on the release
commit.

Workflow definitions now require or schedule the corresponding hosted evidence.
They are not described as hosted-green until these commits are pushed and complete.

## Open, non-substitutable evidence

1. An independent application-security review with no unresolved critical/high
   finding (`G-301`).
2. Keyboard/zoom/high-contrast checks, NVDA on Windows, and VoiceOver with branded
   Safari (`G-303`).
3. Branded Edge/Firefox/Safari and installed-PWA behavior on representative physical
   Android/iOS devices (`G-303`).
4. Low-end physical-device performance and representative real-user field data
   (`G-304`).
5. A restore and incident rehearsal witnessed in the intended deployment environment,
   with measured recovery time/data point and retained evidence (`G-305`).
   The prior Phase 1–3 unfamiliar-user/adopter gates also remain open and are not
   waived by Phase 4 automation.

## Next gate action

Concentrate maintainer-automatable execution on the numbered Phase 5 backlog while
scheduling the independent/manual evidence above. Do not convert a hosted demo or
automated beta surface into evidence of independent adoption.
