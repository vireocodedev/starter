# Release security controls

This document is the source-owned security contract for Starter automation. It
separates controls enforced by the repository from controls that a GitHub
administrator must enable. A source change cannot prove a provider setting.

## Enforced in source

### Immutable dependencies

Every external action is pinned to a full commit SHA and carries its human-readable
release tag as a comment. The accepted mapping lives in
`contracts/github-actions-policy.json`; `corepack npm run security:workflow` fails when a
workflow uses a floating tag, an unapproved SHA, or a stale version comment.

Dependabot proposes GitHub Actions updates weekly. An update must:

1. originate from the action's canonical repository;
2. resolve the proposed release tag to its commit independently;
3. review release notes and material source/permission changes;
4. update both the workflow reference and the policy contract; and
5. pass `corepack npm run security:workflow` and the authoritative repository gate.

The Gitleaks CLI container is likewise pinned to a reviewed multi-architecture
manifest digest. Its tag and digest are recorded in the same policy contract.

### Least-privilege jobs

All workflows start with `permissions: {}`. Each job opts into only its required
scopes:

| Workflow/job               | Access                                                                                 | Reason                                        |
| -------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------- |
| CI TypeScript/JVM          | `contents: read`, `packages: read`                                                     | Checkout, install, build, and verify          |
| Security secret scan       | `contents: read`                                                                       | Fetch and scan complete history               |
| Storybook build            | `contents: read`, `packages: read`                                                     | Build the deployment artifact                 |
| Storybook deploy           | `pages: write`, `id-token: write`                                                      | Deploy through GitHub Pages OIDC              |
| Scheduled support evidence | `contents: read`, optional `packages: read`                                            | Build matrix evidence and retain metadata     |
| Release verification       | `contents: read`, `packages: read`                                                     | Verify the exact candidate without writes     |
| Release evidence           | `contents: read`, `packages: read`                                                     | Build checksums, SBOM, and dry-run artifacts  |
| Public SBOM attestation    | `contents: read`, `id-token: write`, `attestations: write`, `artifact-metadata: write` | Sign exact registry subjects with GitHub OIDC |
| npm release                | `contents/packages/pull-requests: write`                                               | Release PR, tags, and package publication     |
| JVM publication            | `contents: read`, `packages: write`                                                    | Query and publish Maven artifacts             |
| JVM tag                    | `contents: write`                                                                      | Create the version marker only                |
| Published JVM verification | `contents: read`, `packages: read`                                                     | Resolve artifacts as an external consumer     |

Checkout credentials are disabled everywhere except the isolated JVM tag job.
Dependency lifecycle scripts are disabled during installation in the npm write
job. Candidate verification runs in separate read-only jobs before either package
publisher can start. Unexpected registry responses fail closed rather than being
treated as permission to publish.

### Secret detection

`corepack npm run security:secrets` scans the complete reachable Git history with Gitleaks
and redacts detected values. The Security workflow runs it for pull requests,
pushes to `main`, weekly, and on demand. Its checkout is credential-free and the
scanner receives no GitHub token or repository write permission.

The initial source-owned baseline on 2026-08-26 scanned 518 commits and about 11 MB
without a finding. A clean scan is evidence, not proof that a credential never
existed or was never exposed elsewhere.

### Code and dependency scanning

CodeQL analyzes Java and JavaScript/TypeScript on pull requests, pushes to `main`,
weekly, and on demand. The Java database uses an explicit JVM compilation rather
than build-system guessing. Dependency review blocks pull requests that introduce a
known vulnerability of moderate severity or higher. Dependabot alerts and security
updates supplement those source-owned gates.

Dependabot also opens weekly, grouped minor/patch updates for the root npm
workspace lock graph and the `jvm/` multiproject Gradle graph; majors remain
isolated for review. A separate Tuesday workflow installs the committed npm graph
and runs `npm audit`, then resolves every production and test configuration in the
Gradle multiproject build through OWASP Dependency-Check. Both lanes fail at
moderate severity (CVSS 4.0 for JVM). The JVM lane requires the repository's
`NVD_API_KEY` secret so advisory refreshes are authenticated and do not depend on
the heavily rate-limited anonymous API. A missing key fails closed before analysis.
The aggregate scanner runs without Gradle's configuration cache and parallel mode
because its cross-project resolution is not compatible with either optimization.

Vulnerability suppressions are deny-by-default. A JVM false-positive or temporary
risk acceptance must be narrowly selected in
`jvm/config/dependency-check-suppressions.xml`, identify `owner`, `rationale`, and
`tracking` in its notes, and carry a future UTC `until` timestamp. The build rejects
anonymous or expired entries and Dependency-Check rejects stale, unused rules.
There are currently no approved exceptions. npm findings have no suppression lane:
they require a dependency/override remediation or a reviewed change to this policy.

These scanners are complementary: CodeQL examines source behavior, dependency
review examines a pull request's dependency change, Dependabot monitors known
vulnerabilities after merge, and Gitleaks scans history for credential-like
material. None substitutes for threat modeling or independent review.

## Verified GitHub settings

An authenticated API audit on 2026-08-27 verified these settings on both Starter
and Template:

- private vulnerability reporting enabled;
- Dependabot vulnerability alerts and automated security updates enabled;
- secret scanning, push protection, non-provider patterns, and validity checks
  enabled;
- default workflow-token access set to read-only and workflow approval of pull
  requests disabled; and
- full-length commit SHA pinning required for actions.

Repository-owned workflow policy still checks every action against a reviewed
action/SHA/version map. Provider SHA enforcement is defense in depth rather than a
replacement for that allowlist.

## Remaining GitHub settings

An administrator must record a dated API export or review note for each remaining
item before the Phase 1 security gate closes:

- restrict allowed actions to GitHub-owned actions plus the reviewed Changesets
  and Gradle actions; repository SHA enforcement is already enabled;
- protect `main`: require pull requests, current approving CODEOWNERS review for
  `.github/**`, dismissal of stale approvals, conversation resolution, and the
  TypeScript, JVM, workflow-policy, and secret-scan checks;
- prohibit force pushes and deletion of `main`; tightly limit bypass identities;
- protect the `github-pages` environment and restrict it to the intended branch;
- before moving publication to a public registry, split release-PR maintenance from
  publication and put npm/Maven publication jobs behind a `package-release`
  environment with required reviewers and deployment-branch/tag restrictions; and
- give at least two trusted maintainers recoverable access to the organization,
  registries, environments, security inbox, and signing/provenance identities.

The release-PR and npm publication workflows are now split, and npm publication is
protected by `package-release`. The Maven and Pages environment findings remain in
the dated recovery exercise.

## Review and release rules

- Treat changes to `.github/workflows/**`, this policy, scanner scripts, publication
  descriptors, and signing/provenance configuration as release-security changes.
- Require CODEOWNERS review from someone other than the author when more than one
  qualified maintainer is available.
- Never run fork-authored code with write tokens or repository secrets.
- Never weaken a failing verification or security gate to complete a release.
- Never republish the same immutable version. Correct forward with a new version;
  deprecate, yank, or withdraw a broken version using the registry's supported
  mechanism.
- Preserve the workflow run, commit, artifact coordinates, checksums/provenance,
  and incident link for each stable release.

## Release evidence boundary

`corepack npm run release:evidence` builds all seven npm tarballs, publishes the
six JVM modules to an isolated Maven repository, audits both artifact families,
generates npm and JVM CycloneDX SBOMs, and records SHA-256/SHA-512 subjects in a
manifest bound to the clean Git commit and pinned toolchain. The release workflow
retains that unsigned candidate evidence before either publisher starts.

This candidate evidence remains deliberately classified as **unsigned
release-candidate evidence**, not provenance. Publication jobs rebuild and do not
promote those candidate bytes.

After public npm or Maven verification succeeds,
`corepack npm run release:collect-public-evidence` independently downloads the exact
registry artifacts. It requires registry SRI and a provenance URL for all seven npm
tarballs, requires Maven Central SHA-256 agreement for all 27 BOM/module artifacts,
and regenerates populated npm/JVM CycloneDX documents. The
`Attest public release SBOMs` workflow then uses GitHub OIDC and the public Sigstore
instance to bind each ecosystem SBOM to those exact public subject digests. It
verifies every subject against the CycloneDX predicate, exact workflow certificate
identity, and `main` source ref, then retains subjects, manifests, checksums, SBOMs,
and signed bundles for 90 days.

Hosted run
[`33083933339`](https://github.com/vireocodedev/starter/actions/runs/33083933339)
verified this path for npm attestation
[`43426192`](https://github.com/vireocodedev/starter/attestations/43426192), Maven
attestation
[`43426201`](https://github.com/vireocodedev/starter/attestations/43426201), and
retained evidence artifact
[`9651461596`](https://github.com/vireocodedev/starter/actions/runs/33083933339/artifacts/9651461596).
These SBOM claims supplement, rather than replace, npm registry provenance and
Maven PGP signatures.

## Evidence checklist

Before each stable public release, attach or link:

- the reviewed action/image policy diff;
- green read-only candidate verification and secret scan;
- protected-environment approval and publisher identity;
- published-coordinate consumer verification from empty caches;
- generated candidate and exact-public npm/JVM SBOM/checksum evidence, signed SBOM
  attestation verification, plus published provenance and signature verification;
  and
- the rollback/withdrawal decision owner.

Provider controls not listed in the verified section remain **unverified** until
their evidence is recorded. Do not infer unlisted GitHub or registry settings from
this source contract.
