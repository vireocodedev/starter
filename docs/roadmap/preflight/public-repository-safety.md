# Public repository safety preflight

Audit date: 2026-08-26

Status: **not ready to change visibility**

This audit asks whether the current Starter repository and its history can be made
public without unintentionally disclosing secrets, personal information, private
materials, or unsupported release claims. It does not authorize a visibility
change, public-coordinate migration, or package release.

## Reproducible checks

Run:

```bash
npm run public:audit
```

The audit reports paths rather than matched values so a possible credential is not
copied into logs. It checks:

- the tracked tree and Git diffs for high-confidence private-key and provider-token
  formats;
- current and historical sensitive filenames such as private keys, keystores, and
  non-example `.env` files;
- current tracked absolute workstation paths; and
- commit-author email domains while suppressing complete addresses.

The narrow audit is complemented by `npm run security:secrets`, which runs the
digest-pinned Gitleaks CLI across complete reachable Git history with redacted
findings. Neither scanner replaces GitHub secret scanning/push protection,
provider-side token revocation, or manual review.

## Findings

| ID      | Severity | Finding                                                                                                                                                                                                                                            | Required disposition                                                                                                                                                                            |
| ------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PRS-001 | Blocker  | Git history contains at least 533 commits authored with a personal Gmail address and 29 with GitHub's no-reply domain. Public visibility would expose the complete author address embedded in every affected commit.                               | Repository owner explicitly accepts disclosure or approves a coordinated history rewrite before publication. Do not infer consent.                                                              |
| PRS-002 | Blocker  | Professional clearance and final ownership for “Vireo Code” and “Vireo Framework” remain pending. The root MIT license currently attributes copyright to `vireocodedev`, which may not be the final legal owner wording.                           | Record the cleared identity/owner and review license attribution before visibility changes.                                                                                                     |
| PRS-003 | Resolved | The digest-pinned Gitleaks CLI scanned 518 commits (about 11 MB) without a finding on 2026-08-26. A tokenless read-only workflow now scans pull requests, `main`, weekly, and on demand.                                                           | Keep the scanner/policy required and enable provider secret scanning and push protection before public release.                                                                                 |
| PRS-004 | Resolved | Every external action is pinned to a reviewed commit; workflow-level access defaults to none; candidate verification is read-only; and npm publication, Maven publication, JVM tagging, and Pages deployment have isolated write scopes.           | Enforce the required branch/action/environment settings in `docs/security/release-security-controls.md`; complete public-registry provenance/signing work before changing distribution targets. |
| PRS-005 | Major    | `SECURITY.md` directs reporters to GitHub private vulnerability reporting, but the repository setting and backup access cannot be verified from source.                                                                                            | Enable and test private vulnerability reporting when the repository becomes public; document a monitored fallback contact and recovery owner.                                                   |
| PRS-006 | Major    | Repository/package metadata and documentation intentionally contain current private GitHub Package endpoints and the pre-public `starter` coordinates. They are configuration history, not leaked credentials, but would confuse public consumers. | Replace them only in the coordinated coordinate/distribution migration; do not publish the current consumer instructions as the public path.                                                    |
| PRS-007 | Minor    | The only tracked binary/media-like file is the Gradle wrapper JAR. No first-party raster image, font, audio, or video asset is tracked.                                                                                                            | Verify the wrapper checksum/source policy and retain upstream license handling; repeat the asset audit if branding files are added.                                                             |

## Negative evidence recorded

At the audited commit:

- no high-confidence private-key, AWS access-key, GitHub token, npm token, or Stripe
  key format was found in the tracked tree or Git diff history;
- no private-key, keystore, signing-key, or non-example `.env` filename was found in
  the tracked tree or path history;
- no tracked absolute Unix/macOS/Windows user-home workstation path was found;
- no tracked first-party raster image, font, audio, or video asset requires a
  separate provenance decision; and
- generated JVM build output, IDE `bin` output, `node_modules`, Storybook output,
  and research raw-material directories are ignored rather than tracked.

Negative pattern-search evidence is time-bound and incomplete by design. Rerun the
checks immediately before changing visibility and after any history rewrite.

## Visibility gate

The repository may move to a final manual/public-provider review only after:

1. PRS-001 has an explicit owner decision;
2. identity and copyright-owner wording are approved;
3. provider secret scanning/push protection and the source-owned full-history gate
   are required checks;
4. private vulnerability reporting, branch/environment protection, and recovery
   access are verified; and
5. the package-coordinate migration is ready to land atomically with public
   documentation and clean-consumer checks.

Even after those conditions pass, changing repository visibility remains an
explicit external action requiring repository-owner approval.
