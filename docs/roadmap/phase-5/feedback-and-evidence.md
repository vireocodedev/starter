# Public-beta feedback and aggregate evidence

Status: **machine intake ready; zero qualifying external sessions and zero independent active teams recorded; public-beta gate HOLD**. See the dated [external-gate readiness record](evidence/external-gate-readiness-2026-09-01.md).

## Evaluation paths

- Use the Template's 10-minute flagship evaluation for a bounded technical review.
- File a [**Public-beta evaluation** issue](https://github.com/vireocodedev/starter/issues/new?template=public_beta_feedback.yml) for a sanitized task outcome, including failures and objections.
- File an [**Independent adopter check-in**](https://github.com/vireocodedev/starter/issues/new?template=adopter_check_in.yml) only when the Phase 5 qualification statements are true.
- Use Discussions for open-ended public questions and design feedback. Use the private security-advisory path for suspected vulnerabilities.

GitHub issues are public, require a GitHub account to submit, and retain their authors according to GitHub's policies. The committed roadmap aggregate never copies participant handles, names, organizations, repository links, recordings, source, application data, or free-form raw responses. Raw research material and any identity mapping belong only in an approved access-controlled system outside this repository.

## Triage

Maintainers target an initial classification within two business days; this is a target, not a support SLA.

1. Redirect security findings to the private process and remove exposed secrets or personal data where repository permissions allow.
2. Label reproducible supported-path defects as bugs and connect them to the affected public version.
3. Label documentation or diagnostic failures separately from product defects.
4. Record blockers against `P1-15`, `P2-08`, `P3-09`, or the applicable Phase 5 item.
5. Aggregate only consented, qualifying outcomes. Do not infer success from downloads, stars, issue authorship, automation, or maintainer activity.
6. Update the aggregate in a reviewed pull request; a second maintainer verifies the arithmetic, qualification, and privacy boundary.

## Aggregate workflow

`docs/roadmap/phase-5/evidence/aggregate.json` is the only committed participant-derived evidence record. Run:

```bash
corepack npm run beta:evidence:check
```

The policy verifies schema, arithmetic, required task counters, non-negative values, and forbidden identity keys. The hosted workflow produces a machine-readable summary artifact and declares whether the independent-adopter gate passes. A green workflow means the record is valid; it does not mean the gate passes.

## Gate interpretation

Phase 5 requires at least three qualifying independent active teams and at least one maintained production-like deployment through a supported upgrade. Both thresholds must be satisfied in the aggregate. Until then, the script reports `HOLD` and public copy must not describe Vireo as public-beta ready or independently adopted. Reachable forms, label configuration, endpoint health, and a green aggregate workflow establish only machine intake readiness.
