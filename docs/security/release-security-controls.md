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

| Workflow/job               | Access                                      | Reason                                       |
| -------------------------- | ------------------------------------------- | -------------------------------------------- |
| CI TypeScript/JVM          | `contents: read`, `packages: read`          | Checkout, install, build, and verify         |
| Security secret scan       | `contents: read`                            | Fetch and scan complete history              |
| Storybook build            | `contents: read`, `packages: read`          | Build the deployment artifact                |
| Storybook deploy           | `pages: write`, `id-token: write`           | Deploy through GitHub Pages OIDC             |
| Scheduled support evidence | `contents: read`, optional `packages: read` | Build matrix evidence and retain metadata    |
| Release verification       | `contents: read`, `packages: read`          | Verify the exact candidate without writes    |
| Release evidence           | `contents: read`, `packages: read`          | Build checksums, SBOM, and dry-run artifacts |
| npm release                | `contents/packages/pull-requests: write`    | Release PR, tags, and package publication    |
| JVM publication            | `contents: read`, `packages: write`         | Query and publish Maven artifacts            |
| JVM tag                    | `contents: write`                           | Create the version marker only               |
| Published JVM verification | `contents: read`, `packages: read`          | Resolve artifacts as an external consumer    |

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

## Required GitHub settings

An administrator must record a dated screenshot/export or review note for each
item before public release:

- set the default workflow token to read-only and disallow workflows from creating
  or approving pull requests except where the reviewed release workflow requires
  it;
- restrict allowed actions to GitHub-owned actions plus the reviewed Changesets
  and Gradle actions, with full-SHA pinning required where the provider supports it;
- protect `main`: require pull requests, current approving CODEOWNERS review for
  `.github/**`, dismissal of stale approvals, conversation resolution, and the
  TypeScript, JVM, workflow-policy, and secret-scan checks;
- prohibit force pushes and deletion of `main`; tightly limit bypass identities;
- enable GitHub secret scanning, push protection, validity checks, and alerts in
  addition to the repository-owned Gitleaks gate;
- enable and test private vulnerability reporting;
- protect the `github-pages` environment and restrict it to the intended branch;
- before moving publication to a public registry, split release-PR maintenance from
  publication and put npm/Maven publication jobs behind a `package-release`
  environment with required reviewers and deployment-branch/tag restrictions; and
- give at least two trusted maintainers recoverable access to the organization,
  registries, environments, security inbox, and signing/provenance identities.

The current Changesets job both maintains a release PR and publishes after that PR
merges. Gating the whole job behind a protected environment would require approval
for ordinary release-PR maintenance. The public-registry pipeline must split those
responsibilities before claiming protected publication.

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
generates an npm CycloneDX SBOM, and records SHA-256/SHA-512 subjects in a manifest
bound to the clean Git commit and pinned toolchain. The release workflow retains
that unsigned candidate evidence before either publisher starts.

This is deliberately classified as **unsigned release-candidate evidence**, not
provenance. The current private pipeline rebuilds during publication and therefore
does not yet promote these exact bytes. The accepted public pipeline must publish
the reviewed subjects (or prove a byte-for-byte rebuild), attach registry-backed
signed provenance, generate a JVM dependency SBOM, and verify those attestations
from a credential-free consumer. Source-owned dry runs must not be described as
cryptographic trust.

## Evidence checklist

Before each stable public release, attach or link:

- the reviewed action/image policy diff;
- green read-only candidate verification and secret scan;
- protected-environment approval and publisher identity;
- published-coordinate consumer verification from empty caches;
- generated provenance/SBOM/checksum evidence once those later roadmap controls
  land; and
- the rollback/withdrawal decision owner.

Provider controls remain **unverified** until their evidence is recorded. Do not
translate this source contract into a claim that GitHub or registry settings are
already enabled.
