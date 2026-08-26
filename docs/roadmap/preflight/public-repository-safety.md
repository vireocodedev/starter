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

The scan is deliberately narrow enough to avoid printing or normalizing candidate
secrets. It does not replace GitHub secret scanning, a dedicated scanner such as
Gitleaks, provider-side token revocation, or manual review.

## Findings

| ID      | Severity | Finding                                                                                                                                                                                                                                            | Required disposition                                                                                                                                                                            |
| ------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PRS-001 | Blocker  | Git history contains at least 533 commits authored with a personal Gmail address and 29 with GitHub's no-reply domain. Public visibility would expose the complete author address embedded in every affected commit.                               | Repository owner explicitly accepts disclosure or approves a coordinated history rewrite before publication. Do not infer consent.                                                              |
| PRS-002 | Blocker  | Professional clearance and final ownership for “Vireo Code” and “Vireo Framework” remain pending. The root MIT license currently attributes copyright to `vireocodedev`, which may not be the final legal owner wording.                           | Record the cleared identity/owner and review license attribution before visibility changes.                                                                                                     |
| PRS-003 | Blocker  | No dedicated provider-aware secret scanner is installed or enforced in CI. The reproducible narrow scan found no high-confidence token/private-key match, but absence from that pattern set is not comprehensive proof.                            | Run a dedicated full-history scan in a protected environment, review results without committing a report containing secrets, revoke any real credential found, and add ongoing secret scanning. |
| PRS-004 | Major    | Release and CI workflows use floating major action tags and broad release permissions; package publication still targets private GitHub Packages.                                                                                                  | Pin reviewed actions, minimize job permissions, separate verification/publication, and complete the release-security preflight before public release.                                           |
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
3. a dedicated protected full-history secret scan is clean or all findings are
   revoked and removed;
4. workflow permissions and public release boundaries are hardened;
5. private vulnerability reporting and recovery access are verified; and
6. the package-coordinate migration is ready to land atomically with public
   documentation and clean-consumer checks.

Even after those conditions pass, changing repository visibility remains an
explicit external action requiring repository-owner approval.
