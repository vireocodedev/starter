# Security incident and release recovery runbook

Use this runbook for a suspected leaked credential, compromised maintainer or
workflow, malicious dependency/action, unauthorized package, or vulnerable release.
Containment comes before history cleanup or public explanation.

## Roles

Assign these roles explicitly for an incident; one person may hold several roles in
a small team:

- **incident lead** — owns severity, decisions, timeline, and closure;
- **credential owner** — revokes and replaces affected access;
- **release owner** — freezes and restores publication/deployment;
- **security reporter liaison** — protects reporter confidentiality and coordinates
  disclosure; and
- **backup owner** — can recover organization, registry, signing, and reporting
  access if the primary maintainer is unavailable.

Named people and private contact details belong in the organization's protected
operations system, not this public repository.

## First response

1. Open a private incident record and preserve the original report and timestamps.
2. Assume exposed credentials are compromised. Revoke/rotate them immediately;
   deleting a commit is not revocation.
3. Disable the affected workflow, environment, publisher, deploy key, session, or
   account while preserving logs and audit evidence.
4. Freeze releases if package integrity, source integrity, or signing identity is
   uncertain.
5. Identify affected repositories, forks, workflow logs/artifacts, packages,
   releases, deployments, and downstream consumers.
6. Avoid copying secrets into issues, chat, commands, screenshots, reports, or Git
   history. Redact values while retaining safe identifiers and timestamps.

## Investigation and remediation

- Establish the earliest exposure and the last known-good source and release.
- Compare workflow definitions and action/image SHAs against
  `contracts/github-actions-policy.json`.
- Review organization, repository, environment, package, and identity audit logs.
- Re-run the full-history secret scan and relevant dependency/code scanners.
- Patch the vulnerability or supply-chain boundary on a private incident branch.
- If history rewriting is necessary, do it only after revocation, with an approved
  force-push window and explicit clone/fork/contributor coordination. History
  rewriting cannot remove already copied data.
- Add a regression test or enforceable policy for every code-owned failure mode.

## Package and release recovery

For a broken but uncompromised release, stop promotion, mark the affected version
as deprecated/withdrawn where supported, document impact, and publish a corrected
new version. Do not overwrite or silently reuse a version.

For a suspected compromised release:

1. disable all publishers and protected-environment approvals;
2. identify every affected npm/Maven coordinate, tag, release, provenance statement,
   documentation version, and deployed artifact;
3. revoke the publisher/signing identity and rotate recovery credentials;
4. deprecate, yank, or quarantine the affected artifacts according to registry
   rules, preserving evidence;
5. restore from a reviewed last-known-good commit in a clean environment;
6. verify source, dependencies, packed artifacts, checksums/SBOM/provenance, and
   credential-free consumers before publishing a new version; and
7. communicate the affected range, safe version, required consumer action, and any
   residual risk.

## Disclosure and closure

- Acknowledge a complete private report within the target in `SECURITY.md`.
- Coordinate disclosure with the reporter when possible; do not promise an embargo
  that the project cannot operationally maintain.
- Use a GitHub Security Advisory/CVE when the impact and affected releases justify
  it. Publish remediation before or with disclosure whenever practical.
- Record a redacted timeline, root cause, affected assets, response actions,
  consumer guidance, and follow-up owners.
- Restore release access only after two-person review of provider settings and a
  clean end-to-end release rehearsal.
- Close only when credentials are revoked, affected users have guidance, regression
  controls are green, and every follow-up has an owner and due date.

Exercise this runbook before the first stable public release and at least annually.
The exercise must prove that the backup owner can receive a report, stop a release,
rotate access, and restore a verified publication without relying on the primary
maintainer's active session.
