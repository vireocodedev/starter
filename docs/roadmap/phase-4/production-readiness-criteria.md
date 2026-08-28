# Phase 4 production-readiness criteria

Baseline date: 2026-08-28. Target maturity: public beta; this is not a Vireo 1.0
certification or a guarantee that an unmodified generated application is secure
for every threat model.

## Gate

| Area                  | Pass criterion                                                                                                                                                                                                          | Current evidence                                                                                                                                                          | State at baseline |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Security              | No known critical vulnerability; default auth abuse cases pass; threat model, hardening guide, response SLA, dependency and secret scanning are current; an independent review has no unresolved critical/high finding. | Spring Security defaults, CodeQL, dependency review, dependency audit, secret scan, provenance and SBOM workflows exist. No committed threat model or independent review. | Partial           |
| Offline               | Every supported offline claim names scope, consistency, durability, ordering, retry, conflict, identity, version and recovery behavior and maps to adversarial tests.                                                   | SQLite queue/hydration/lifecycle and JVM replay tests exist. Template truthfully claims only an offline shell; no integrated entity workflow is enabled.                  | Partial           |
| Accessibility         | Canonical flows have no critical/serious automated violations; keyboard, reflow, contrast, reduced-motion and focus checks pass; NVDA and VoiceOver evidence is dated.                                                  | Storybook axe failures are blocking and Chromium mobile/desktop flows exist. Manual AT and zoom/reflow evidence is absent.                                                | Partial           |
| Platforms/PWA         | Declared automated engines pass production-bundle flows; install, update, offline launch, logout and display-mode checks exist; required branded-browser and physical-device rows are dated.                            | Chromium, Playwright Firefox/WebKit and manifest/service-worker unit coverage exist. Branded and physical-device evidence is absent.                                      | Partial           |
| Performance           | Production payload and representative browser budgets are enforced; results identify the machine/profile; low-end device and field observations are recorded without turning lab data into field claims.                | Bundle budgets and verification duration/RSS budgets exist. Lighthouse, route-runtime, physical low-end and field evidence are absent.                                    | Partial           |
| Database/operations   | Backup and restore preserve representative data; PostgreSQL 17→18 upgrade rehearsal passes; rollback and failed-migration procedures are documented; health, logs, metrics, alerts and incident roles are defined.      | PostgreSQL 17/18 full-stack tests and a PostgreSQL 18 production-like deployment pass. Backup, restore, upgrade and incident rehearsals are absent.                       | Partial           |
| Release compatibility | Every supported source release is exercised through its documented project/data upgrade path, including dry run and rollback guidance.                                                                                  | Package compatibility policy and fresh-consumer checks exist. No supported project migration command or cross-release fixture exists.                                     | Missing           |
| Disclosure            | Known limitations and unverified rows are public and each claim links to automation, current manual evidence, or an explicit limitation.                                                                                | Existing policies disclose maturity and platform boundaries. Phase 4 limitations need a consolidated publication.                                                         | Partial           |

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
