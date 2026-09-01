# External-gate readiness record — 2026-09-01

## Decision

**External-evidence machinery is READY; the public-beta gate remains HOLD.** This
record distinguishes whether a public participant can reach the intake paths from
whether any participant has supplied qualifying evidence. It does not count the
maintainer-operated flagship, automation, downloads, stars, or this audit as an
external session or adopter outcome.

## Public-surface observation

Anonymous HTTP checks returned `200` for `https://vireocode.com`,
`https://demo.vireocode.com`, and the public Discussions page. At
2026-09-01T00:09:21+02:00, both direct issue-form URLs resolved to GitHub's login
boundary with their intended return paths intact. A signed-in GitHub user needs no
repository membership to use the forms, but GitHub does require an account to view
and submit them.

The pre-rename **Public-beta evidence** workflow is retained as historical
aggregate-contract evidence: [run 33429747974](https://github.com/vireocodedev/starter/actions/runs/33429747974),
completed 2026-08-31T19:17:46Z. A green workflow validates the aggregate contract;
it is not an external result.

Post-rename npm release continuity is separately complete: all eight packages use
the canonical `vireocodedev/vireo` trusted publisher, `create-vireo@0.8.0` was
published, anonymous verification succeeded, and all npm/Maven SBOM attestations
were verified. The exact release evidence is retained in the
[Phase 1 continuity record](../../phase-1/evidence/npm-release-continuity-2026-09-01.md).
It confirms public artifact availability but does not change any external-session
or adoption outcome.

## Source and live-label state

The committed desired state declares the form labels below. The repository policy
checks their exact payload and rejects any issue-form label that is not declared.

| Label           | Color    | Description                                    | Live state at observation |
| --------------- | -------- | ---------------------------------------------- | ------------------------- |
| `beta-feedback` | `5319e7` | Sanitized public-beta evaluation outcome       | Applied and authenticated |
| `beta-adopter`  | `0e8a16` | Privacy-safe independent adopter qualification | Applied and authenticated |

At 2026-09-01T00:06:31+02:00, an authenticated repository read confirmed that the
repository is public and has both Issues and Discussions enabled. Exact label GETs
matched both names, lowercase colors, and descriptions above. A prefix query found
zero matching evaluation/adopter issues. The source contract and live label state
are therefore aligned; neither fact is external outcome evidence.

## External evidence state

`aggregate.json` remains the only committed participant-derived record. Its current
counts are all zero: `0` qualifying workflow sessions, `0` qualifying issue or
discussion outcomes, `0/3` qualifying independent active teams, and `0/1`
maintained deployments through a supported upgrade. No qualifying external session,
team, or upgrade has been recorded.

The hold is therefore required until the qualification criteria in
[`../public-beta-criteria.md`](../public-beta-criteria.md) are met. Do not infer a
passing gate from reachable forms, healthy endpoints, a successful workflow, or the
presence of unqualified public discussion.

## Next actions

1. Recruit unfamiliar evaluators through the public flagship and direct forms.
2. Privacy-review qualifying submissions, update only aggregate counters in a
   reviewed pull request, and retain the gate as `HOLD` until both thresholds pass.
