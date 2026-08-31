# Public-beta human handoff — 2026-09-01

Machine-controlled closure is **PASS**. Public-beta promotion remains **HOLD** only
for evidence that a person or an external party must produce. The public aggregate
currently records zero workflow sessions, zero qualifying teams, and zero maintained
deployment upgrades; that is an honest starting state, not a failure hidden by the
engineering closure.

## Remaining human work

1. An independent security reviewer assesses the published threat model and reports
   any critical/high finding through the private advisory route.
2. Testers perform the retained physical-device and manual assistive-technology
   scenarios in the Template platform checklist.
3. Two trusted people witness the target-environment recovery rehearsal. The
   maintainer's guarded backup/restore/incident preparation is complete and retained
   at `docs/roadmap/phase-4/evidence/target-recovery-2026-09-01.md`; the remaining
   witness must independently observe the scenario. The retained backup is same-host
   evidence, not an independent failure-domain durability claim.
4. Unfamiliar developers complete the bounded first-run, first-change, generation,
   customization, upgrade, and deployment sessions. Independent adopters then use a
   non-fixture application and submit the qualified adopter check-in.

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
