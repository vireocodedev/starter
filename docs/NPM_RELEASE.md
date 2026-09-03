# Public npm release

Seven `@vireocodedev/*` libraries and the unscoped `create-vireo` command publish as eight public packages on npm. A
release is deliberately split into independently observable stages:

1. Changesets prepares a version pull request.
2. Merging the exact generated ecosystem release PR authorizes the seven classic
   libraries. An exact `create-vireo` adoption remains authorized only by its
   protected Template-adoption PR.
3. A credential-free workflow installs and verifies the immutable public result.

Local builds, pull requests, ordinary CI, and public consumers require no npm
credential.

## Published packages

- `create-vireo`
- `@vireocodedev/history`
- `@vireocodedev/infrastructure`
- `@vireocodedev/localization`
- `@vireocodedev/query`
- `@vireocodedev/shell`
- `@vireocodedev/sqlite`
- `@vireocodedev/ui`

Every manifest explicitly selects `https://registry.npmjs.org`, public access,
and provenance. Package versions are immutable after publication.

## One-time repository and npm setup

1. Confirm that the `vireocodedev` npm organization is controlled by the release
   owners and that publishing accounts use two-factor authentication.
2. Apply the checked-in [`package-release` environment desired state](../.github/environments/package-release.json): restrict it to `main`, require no recurring environment reviewer, and disable administrator bypass. Protected `main` authorization, immutable candidate checks, and release qualification remain mandatory. Capture an authenticated API export after applying it.
3. Only when bootstrapping a previously unpublished package, use a short-lived
   granular npm access token owned by the applicable package owner. Temporarily store it only as the `NPM_TOKEN` secret on the
   `package-release` environment and explicitly wire it into the publish step in
   a reviewed workflow change.
4. After the first publication, open each package's npm settings and add this
   trusted publisher:

   | Field                | Value             |
   | -------------------- | ----------------- |
   | Organization or user | `vireocodedev`    |
   | Repository           | `vireo`           |
   | Workflow filename    | `release-npm.yml` |
   | Environment          | `package-release` |

5. Remove the GitHub `NPM_TOKEN` environment secret and revoke the bootstrap
   token. Future releases authenticate through GitHub Actions OIDC. Do not retain
   a long-lived registry token as a fallback.

The repository must remain public for npm to associate generated provenance with
its source. The publish job runs on a GitHub-hosted runner with `id-token: write`;
the other jobs do not receive that permission.

## Prepare a release

For an ordinary change, add a Changeset in the same pull request:

```bash
corepack npm exec changeset
corepack npm run verify -- silent
```

After that pull request merges, the trusted, `main`-only **Maintain ecosystem release
PR** workflow creates or refreshes the version pull request. Review its package
versions, changelogs, lockfile, and the complete CI result. Its reviewed, pinned
steps contain no approval or merge operation; merging it is the sole routine
authorization for the exact generated ecosystem release.

Before starting publication, the release owner can run:

```bash
corepack npm ci
corepack npm run release:validate
corepack npm run release:smoke
```

`release:validate` fails if a Changeset remains, a coordinate is malformed, a
version is outside the approved `0.x` line, or there is nothing new to publish.
`release:smoke` packs every workspace and exercises the isolated tarballs.

## Protected cross-artifact release order

The current npm line depends on coordinated public libraries and Maven artifacts.
For mixed releases, the coordinator publishes and anonymously proves Maven Central
first, finalizes its immutable JVM release, then publishes and proves the seven libraries.
Then prepare and publish the immutable Template release. Vireo opens one adoption
draft; maintainers complete any project-upgrade work and version the same PR.
Merging that protected PR can publish only its exact absent `create-vireo@X`
coordinate. The npm verify job independently repeats the anonymous Maven
prerequisite using the exact `current.maven.version` from the ecosystem contract,
so it blocks publication rather than the release pull-request merge.

## Publish

For an ordinary library release, merge the exact generated ecosystem release PR;
the protected coordinator plans and publishes only the coordinates advanced by that
merge. For an exact Template adoption, merge the protected,
fully-versioned adoption PR; its resulting `main` push plans and may publish only
the exact absent `create-vireo@X` candidate. Neither path has a recurring
`package-release` environment reviewer.

In both cases, review the retained verify evidence and confirm the publish job
reports the published packages, or an explicit successful recovery when every
reviewed coordinate was already public.

The coordinator uses the pinned Changesets action only to publish the exact
planner-authorized coordinates and create their annotated remote tags. It then
runs `finalize-npm-releases.mjs`, which creates or reconciles one immutable,
stable GitHub Release per authorized coordinate using that package's exact current
changelog entry. A retry where npm and the tag succeeded but GitHub Release
creation was interrupted recovers only that missing exact coordinate Release; it
never scans or mutates unrelated historical coordinates.

The checked-in pre-adoption `create-vireo@0.8.7` receipt is not a publication
path. It has a narrowly pinned no-op compatibility check only; any receipt,
Template identity, tag, or registry-integrity drift fails the automatic planner.

The publish job downloads the retained evidence from the verify job, requires its
source commit and all eight tarball SHA-256 digests to match, then preflights every
registry coordinate, cryptographically audits every already-public package in an
isolated token-free consumer with `npm@12.0.2 audit signatures --json
--include-attestations`, and checks its annotated coordinate tag before making
either mutation. Every registry `200` is historical until its audited SLSA bundle
binds the exact PURL and registry SRI to the stable GitHub repository id, approved
canonical repository or checked-in repository alias, workflow/ref, and the commit
peeled from that package's own `<package>@<version>` tag. A historical coordinate
tag must match that provenance material commit; a missing one is created only at
that commit and is never moved. The publisher passes only absent reviewed tarballs to `npm publish`
and strictly confirms their exact SRI integrity afterwards. It does not rebuild
package bytes. The production workflow is OIDC-only: it does not read
`NPM_TOKEN` or `NODE_AUTH_TOKEN`. npm obtains a short-lived identity from GitHub
Actions and records provenance for each publication.

## Verify the public result

Successful publication automatically starts **Verify public npm release**. It:

- waits for every exact manifest version to become anonymously visible;
- requires npm distribution metadata and a provenance attestation for each;
- installs all eight packages from an empty cache and token-free npm config;
- rejects workspace links and non-npm tarball locations;
- requires a strict peer dependency tree;
- imports every framework-free entry point;
- type-checks all public entry points with `skipLibCheck: false`;
- bundles every UI entry point through Vite; and
- runs `npm audit signatures` over the installed dependency tree.

For each of the eight coordinates, verification independently peels the exact
`<package>@<version>` tag from the canonical `vireocodedev/vireo` repository and
checks the audited SLSA material against that coordinate's commit. Packed package
metadata may name `vireocodedev/vireo` or a checked-in continuity alias such as
`vireocodedev/starter`; registry metadata is discovery evidence only and never
authorizes a repository identity. Machine evidence retains the observed workflow
and material repositories, their canonical/alias classification, repository id,
and per-coordinate release tags.

The workflow retains `.npm-public-verification.json` for 90 days. It can also be
rerun manually from `main`; locally, after publication, use:

```bash
corepack npm run release:verify-public
```

This stage intentionally uses no protected environment and no npm secret. Its
success is the proof that an adopter can consume the release, not merely that a
publisher received a success response.

## Failure and recovery

- If verification times out while npm is propagating a valid release, rerun
  **Verify public npm release**. Do not republish the same version.
- If only some workspaces publish, inspect npm first. A reviewed retry preflights
  all eight coordinates before mutation and may publish only absent tarballs from
  the unchanged retained candidate. Already-public versions are recovered only
  after their audited provenance establishes the tag's source commit; an absent
  historical tag may be recreated at that verified commit, never moved.
- If a published artifact is defective, deprecate it with an actionable message,
  prepare corrected patch versions, and run the normal release path. Never move
  a tag or attempt to overwrite a published version.
- Treat token, OIDC, provenance, signature, or unexpected-registry failures as a
  stopped release. Preserve the evidence and resolve the trust failure before
  continuing.

## Repository-rename trusted-publisher migration

The 2026-09-01 repository rename completed this procedure for each of
`create-vireo`, `@vireocodedev/history`, `@vireocodedev/infrastructure`,
`@vireocodedev/localization`, `@vireocodedev/query`, `@vireocodedev/shell`,
`@vireocodedev/sqlite`, and `@vireocodedev/ui`. The retained [continuity evidence](roadmap/phase-1/evidence/npm-release-continuity-2026-09-01.md)
includes the successful post-rename `create-vireo@0.8.0` publication, anonymous
verification, and SBOM attestation.

Repository rename continuity is therefore per coordinate: retain or recreate each
immutable `<package>@<version>` tag at the exact verified material commit before
accepting a historical package under the canonical repository identity.

Repeat this procedure when a public npm package changes repository identity or a
new public package is introduced:

1. Run `npm trust list <package> --json` and retain the sanitized result.
2. In npm package settings, revoke the old GitHub trusted publisher for repository
   `vireocodedev/starter`.
3. Create a GitHub trusted publisher with organization `vireocodedev`, repository
   `vireo`, workflow file `release-npm.yml`, and environment `package-release`; allow
   publishing.
4. Run `npm trust list <package> --json` again and verify the exact new identity.

Do not perform this mutation from an unauthenticated environment. npm verifies the
repository identity exactly; Maven Central uses protected credentials/environment,
not repository-bound npm OIDC.

Official references: [trusted publishers](https://docs.npmjs.com/trusted-publishers/),
[provenance statements](https://docs.npmjs.com/generating-provenance-statements/),
and [public scoped packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/).
