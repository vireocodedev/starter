# Public-beta human handoff — 2026-09-01

Machine-controlled closure is **PASS**. Public-beta promotion remains **HOLD** only
for evidence that a person or an external party must produce. The public aggregate
currently records zero workflow sessions, zero qualifying teams, and zero maintained
deployment upgrades; that is an honest starting state, not a failure hidden by the
engineering closure.

## Remaining human work

| Gate | Public-beta hold? | Current state | Required qualification and evidence path |
| --- | --- | --- | --- |
| G-107 / P1-09 continuity | Yes | Open | A second trusted maintainer verifies recovery access and independently approves protected changes; retain the restricted recovery exercise result. |
| npm release continuity | Yes | 0/8 trusted-publisher configurations verified after rename | An npm owner with login and 2FA must migrate each package's GitHub trusted publisher from `starter` to `vireo`; follow [NPM release migration](../NPM_RELEASE.md#repository-rename-trusted-publisher-migration). |
| G-301 / P4-01 security | Yes | Open | Independent security review with no unresolved critical/high finding; use the private advisory route and retain sanitized conclusion. |
| G-303 / P4-03 platforms | Yes | Open | Manual AT, branded browser, physical device and installed-PWA checklist results with release, hardware/software, operator, scenario and result. |
| G-304 / P4-04 performance | Yes | Open | Representative low-end physical-device and real-user field measurements; retain method, environment and sanitized observations. |
| G-305 / P4-05 recovery | Yes | Open | A second trusted person witnesses target restore, application acceptance and incident result. [Maintainer preparation](phase-4/evidence/target-recovery-2026-09-01.md) is complete but same-host backup is not an independent-failure-domain claim. |
| P1-15 / P2-08 / P3-09 / P5-06 workflow | Yes | 0 sessions | Unfamiliar developers complete first run, first change, generation, customization, upgrade and deployment; retain only the privacy-safe aggregate in `phase-5/evidence/aggregate.json`. |
| G-309 / P5-07 adoption | Yes | 0/3 teams; 0/1 upgrades | Three qualifying independent teams actively build with Vireo and one maintains a production-like deployment through an upgrade; submit only sanitized qualified check-ins. |
| G-002 / P1-01 identity | No | Accepted pre-1.0/public-beta risk | Professional trademark/identity clearance or documented fallback; retain dated professional decision in the Phase 1 record. |
| G-001 / G-005 / G-006 research | No | Post-beta human-only; zero human evidence | Run retained target-developer persona/job/demand and controlled competitor protocols under D-110 timing. |
| External contribution/publication | No | Post-beta human-only | Validate an authentic external contribution path; obtain permission before publishing adopter examples, testimonials, or case studies. |

Use the public [evaluation form](https://github.com/vireocodedev/vireo/issues/new?template=public_beta_feedback.yml)
for sanitized outcomes, the [adopter check-in](https://github.com/vireocodedev/vireo/issues/new?template=adopter_check_in.yml)
only when its qualification statements are true, and [Discussions](https://github.com/vireocodedev/vireo/discussions)
for open-ended questions. Never include credentials, private source, application
data, identities, or vulnerability details. Security findings go through the private
[security advisory route](https://github.com/vireocodedev/vireo/security/advisories/new).

## Colleague frontend-only start

For a new frontend app, use the public 0.7.0 generator rather than cloning either
framework repository:

```sh
npm create vireo@0.7.0 my-frontend-app -- --profile frontend
cd my-frontend-app
npm run doctor
npm run generate:check
npm run verify
```

The generated project is application-owned. Start with the
[frontend-only adoption guide](../architecture/frontend-only-profile.md), make a
small visible change, run `npm run verify` again, and commit the generated baseline
before adding product features. For full-stack composition, use the same command
with `--profile full-stack`; do not mix local framework source into the generated
application unless you are intentionally working on Vireo itself.

## Evidence update rule

Keep only privacy-safe aggregate counters in
[`phase-5/evidence/aggregate.json`](phase-5/evidence/aggregate.json). Update the
machine-readable readiness contract only after the corresponding evidence is
retained and reviewed; a human gate changes from HOLD to PASS only when its stated
criterion is actually met.
