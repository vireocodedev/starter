# Phase 4 production-readiness criteria

Baseline date: 2026-08-28. Target maturity: public beta; this is not a Vireo 1.0
certification or a guarantee that an unmodified generated application is secure
for every threat model.

## Gate

| Area                  | Pass criterion                                                                                                                                                                                                          | Current evidence                                                                                                                                                                                                                                                                                                                                                 | Current state                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Security              | No known critical vulnerability; default auth abuse cases pass; threat model, hardening guide, response SLA, dependency and secret scanning are current; an independent review has no unresolved critical/high finding. | Threat model, hardening guide, response SLA, redaction, auth/CSRF/session-fixation tests, headers, CodeQL, dependency review/audit, secret scan, provenance and SBOM exist. Independent review is absent.                                                                                                                                                        | Partial — independent review open                              |
| Offline               | Every supported offline claim names scope, consistency, durability, ordering, retry, conflict, identity, version and recovery behavior and maps to adversarial tests.                                                   | The SQLite contract publishes all named semantics and adversarial tests; duplicate IDs, malformed replay, deterministic ordering, and concurrent owner transitions are covered. Template scope remains an offline shell only.                                                                                                                                    | Pass for the declared scope                                    |
| Accessibility         | Canonical flows have no critical/serious automated violations; keyboard, reflow, contrast, reduced-motion and focus checks pass; NVDA and VoiceOver evidence is dated.                                                  | Storybook and full-stack desktop/mobile axe gates pass; landmarks and navigation semantics were corrected. Manual keyboard/zoom/high-contrast, NVDA, and VoiceOver rows remain `Not run`.                                                                                                                                                                        | Partial — manual AT rows open                                  |
| Platforms/PWA         | Declared automated engines pass production-bundle flows; install, update, offline launch, logout and display-mode checks exist; required branded-browser and physical-device rows are dated.                            | Automated checks cover manifest/worker, deep-link offline shell, reconnect, API cache exclusion, and two-build update activation/reload. Physical install/update evidence remains manual; branded/device rows are absent.                                                                                                                                        | Partial — branded/device rows open                             |
| Performance           | Production payload and representative browser budgets are enforced; results identify the machine/profile; low-end device and field observations are recorded without turning lab data into field claims.                | Build/chunk, verification duration/RSS, and production Lighthouse performance/accessibility/best-practice/FCP/LCP/TBT/CLS budgets are enforced with retained artifacts. Physical low-end and field evidence is absent.                                                                                                                                           | Partial — field/device rows open                               |
| Database/operations   | Backup and restore preserve representative data; PostgreSQL 17→18 upgrade rehearsal passes; rollback and failed-migration procedures are documented; health, logs, metrics, alerts and incident roles are defined.      | Guarded helpers and scheduled 17→18 recovery exist. On 2026-09-01 a hosted-demo maintainer rehearsal restored 8 Items/1 user/4 migrations, passed readiness/login/search, and recovered an isolated SEV-3 through immutable recreation; target witness and independent-failure-domain durability evidence remain absent.                                         | Partial — target witness open                                  |
| Release compatibility | Every supported source release is exercised through its documented project/data upgrade path, including dry run and rollback guidance.                                                                                  | Public `create-vireo` 0.8.6 declares the current 0.8.4→0.8.6 edge with dry run, explicit apply, refusal, ownership and rollback guidance; its metadata/provenance fixtures retain the six managed application-skill additions introduced by the historical 0.7.0→0.8.0 edge. The 0.6.0→0.7.0 and original 0.2.0→0.3.0 pairs remain retained historical evidence. | Pass — current adjacent edge active; historical edges retained |
| Disclosure            | Known limitations and unverified rows are public and each claim links to automation, current manual evidence, or an explicit limitation.                                                                                | Template scope/security/offline/accessibility/performance/operations/upgrade docs, the manual checklist, and the dated closure review publish all unverified rows without aggregate production claims.                                                                                                                                                           | Pass                                                           |

## Non-substitutable evidence

The following cannot be completed by repository automation or maintainer-authored
documentation alone:

1. independent application-security review;
2. NVDA with a supported Windows browser and VoiceOver with branded Safari;
3. branded Safari/Edge/Firefox verification on their supported operating systems;
4. Android and iOS installed-PWA checks on physical devices;
5. representative low-end physical-device and real-user field performance; and
6. a restore/incident rehearsal witnessed in the target deployment environment.

These rows remain open until dated evidence identifies the release, hardware,
software, operator, scenario, result, and retained artifact. An unchecked manual
row is a known limitation, not a failure hidden behind aggregate wording.

## Measurement rules

- Merge gates use production artifacts wherever the behavior differs from a dev
  server.
- Scheduled evidence records exact tool/browser/database versions and retains the
  result for at least 90 days when it is a beta-readiness claim.
- Performance budgets are regression thresholds for the canonical Template, not
  promises for application-owned pages or user networks.
- A fixed defect receives a regression test in the narrowest authoritative layer.
- A failed gate is never replaced by prose. It is fixed, explicitly scoped out, or
  kept open with an owner and target phase.
