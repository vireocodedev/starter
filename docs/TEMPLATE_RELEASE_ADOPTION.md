# Immutable Vireo Template adoption

Vireo does not accept a cross-repository write token from Vireo Template. Instead,
`adopt-template-release.yml` polls the public Vireo Template release API at
`:17` and `:47` each hour; it can also be dispatched manually on `main`.

The read-only plan selects only the lowest unique stable `starter-template@X`
release after the checked-in Template version. Before it can stage anything, it
requires a published, non-prerelease, immutable release; an annotated tag that
peels to the manifest commit; Template manifest schema 2; exact seven-library
npm coordinates and SHA-512 integrities; and the exact Maven module set and
digests. It then checks the public npm registry/attestation metadata and Maven
Central POM availability without credentials.

The `template-adoption` environment is used only after that plan succeeds. A
repository-scoped GitHub App token creates one marked draft branch,
`automation/template-X`, and never updates an existing branch or pull request.
The draft records the immutable pin in `template-adoption-intent.json` and an
unresolved report. This is deliberate: artifact digests do not describe safe
consumer project-upgrade transforms. Maintainers must classify any changed
Template paths and add reviewed Vireo-owned transforms before converting that
draft into a releasable CLI version PR. The automation never invents ownership,
baselines, lockfile changes, or application-owned actions.

Once the candidate graph is complete, run `npm run version-packages`. The
existing versioning adapter finalizes the exact Template receipt and updates
the ecosystem/documentation contracts; it remains the sole implementation of
version and documentation synchronization. The same draft already carries the
single `create-vireo` Changeset, so it produces the version, changelog,
lockfile, and synchronized contracts on this adoption PR rather than opening a
second Changesets PR.

When (and only when) the checked-in plan contains `upgrade.ready: true`, the
same polling workflow reconstructs the candidate from current `main` without
credentials, then inspects it. It can merge only one non-draft App-authored
commit whose parent is current `main`, tree and changed paths exactly match the
reconstructed candidate, canonical marker/title/body match, all exact main
ruleset checks from their expected integrations are successful, the merge state
is clean, and every review conversation is resolved. The protected job receives
the App key only after that read-only inspection succeeds, repeats every check,
and sends an expected-head-SHA REST squash merge. It never enables persistent
auto-merge. Pending, stale, altered, or unresolved candidates remain untouched;
altered candidates fail the read-only reconciliation job closed. Current planning deliberately emits
`upgrade.ready: false` unless a deterministic Vireo-owned consumer-upgrade
proof exists, so ordinary adoption PRs remain draft for human/product work.

On the resulting `main` push, `release-npm.yml` may automatically publish only
the absent exact `create-vireo@X` coordinate. It rejects any absent library,
receipt drift, incomplete Template evidence, or mismatched Maven baseline.
Existing candidate validation, registry provenance checks, anonymous public
verification, and SBOM attestation remain mandatory. Manual dispatch with
`confirmation=publish` remains the ordinary library-release and operator-recovery
path; it is separate from automatic CLI adoption.

The pre-adoption `0.8.7` receipt is a one-time compatibility exception: it is
never published or recovered automatically. It can only return a no-op after its
entire checked-in receipt, current Template identity, local annotated
`create-vireo@0.8.7` tag, and pinned public npm integrity all match exactly.
Any drift fails closed; later receipts use the schema-2 immutable-manifest path.

## One-time provider setup

Create a GitHub App installed only on `vireocodedev/vireo` with repository
metadata read, contents read/write, and pull requests read/write. Do not grant
it access to Vireo Template, organization administration, Actions settings,
environments, secrets, packages, or deployments. In the `template-adoption`
environment, add `TEMPLATE_ADOPTION_APP_ID` as a variable and
`TEMPLATE_ADOPTION_APP_PRIVATE_KEY` as a secret. Keep the environment main-only,
with no reviewers or wait timer and administrator bypass disabled.

`package-release` likewise has no recurring reviewer because an exact protected
`main` merge is publication authorization. Its main-only deployment policy,
trusted publisher binding, immutable registry checks, provenance audit, and
release qualification remain required.
