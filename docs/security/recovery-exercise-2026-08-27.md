# Release recovery exercise — 2026-08-27

Status: **source and provider-control tabletop passed; backup-owner exercise open**

## Scenario

A maintainer reports that a package publication identity may be compromised after
an npm and Maven release. The exercise asks whether the public runbook and live
provider controls identify a safe containment, consumer-warning, and restoration
sequence without reusing an immutable version.

## Walkthrough

1. Freeze both protected publication environments and disable the suspected
   publisher before investigating source history.
2. Preserve workflow runs, registry provenance/signatures, package coordinates,
   SBOMs, checksums, and the last-known-good commit in a private incident record.
3. Revoke the publisher identity; rotate signing and recovery credentials. History
   cleanup is not treated as revocation.
4. Run full-history Gitleaks, CodeQL, dependency review/alerts, workflow-policy
   verification, and the complete source and packed-consumer gates.
5. Deprecate or withdraw affected immutable versions where the registry permits;
   never overwrite or silently reuse a version.
6. Build a corrected version from the reviewed last-known-good point, generate both
   CycloneDX SBOMs and checksums, publish through protected environments, and rerun
   anonymous npm/Maven consumers and provenance/signature verification.
7. Publish affected ranges, the safe version, required consumer action, and residual
   risk through a coordinated advisory.

## Evidence checked

- The public incident runbook assigns incident, credential, release, liaison, and
  backup roles and contains revoke, freeze, withdraw, correct-forward, verify, and
  disclosure steps.
- Both repositories have private vulnerability reporting, Dependabot alerts,
  secret scanning, push protection, validity checks, read-only workflow defaults,
  and SHA enforcement enabled.
- Source-owned workflows use explicit least-privilege permissions and pinned action
  identities. Starter package publication is protected by the `package-release`
  environment; the Maven and Pages environments exist but still have gaps recorded
  below.
- Release evidence now generates populated npm and JVM CycloneDX documents and
  digests all candidate subjects.
- Hosted run
  [`33083933339`](https://github.com/vireocodedev/starter/actions/runs/33083933339)
  independently downloaded and registry-hash-validated all seven public npm
  tarballs and 27 Maven Central artifacts, signed two CycloneDX attestations through
  GitHub OIDC/Sigstore, verified every subject against the exact signer identity,
  and retained the complete evidence bundle for 90 days.

## Findings and limitations

- **Open:** no branch protection or repository ruleset currently protects `main`.
- **Open:** allowed Actions remain provider-wide `all`; repository policy rejects
  unreviewed actions, but the provider allowlist should also be narrowed.
- **Open:** `maven-central` lacks reviewers and branch/tag restrictions;
  `github-pages` permits administrator bypass.
- **Open:** only one trusted recovery account is evidenced. This tabletop did not
  prove a backup owner can receive a report, revoke identities, or restore release
  access without the primary maintainer.
- **Closed in source:** npm/JVM CycloneDX SBOMs are signed attestations bound to the
  exact published bytes. npm attestation
  [`43426192`](https://github.com/vireocodedev/starter/attestations/43426192) covers
  seven tarballs; Maven attestation
  [`43426201`](https://github.com/vireocodedev/starter/attestations/43426201) covers
  all 27 Central artifacts.

The runbook is technically actionable, but P1-09 remains partial until the open
provider controls and human backup-owner recovery exercise are completed.
