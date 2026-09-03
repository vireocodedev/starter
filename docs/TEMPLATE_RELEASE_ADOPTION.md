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

On the resulting `main` push, `release-npm.yml` may automatically publish only
the absent exact `create-vireo@X` coordinate. It rejects any absent library,
receipt drift, incomplete Template evidence, or mismatched Maven baseline.
Existing candidate validation, registry provenance checks, anonymous public
verification, and SBOM attestation remain mandatory. Manual dispatch with
`confirmation=publish` is retained only for operator recovery.

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
