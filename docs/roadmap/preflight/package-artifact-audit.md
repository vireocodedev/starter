# Public package artifact preflight

Audit date: 2026-08-26

Status: **artifact boundaries enforced; first public npm and Maven releases verified**

This checkpoint inspects what a registry would receive rather than treating a
successful source build as proof of a safe package. It does not publish, change a
registry, reserve coordinates, or configure signing credentials.

## npm contract

The authoritative TypeScript gate now runs `corepack npm run release:smoke` after building
all workspaces. The check creates real tarballs in a throwaway directory and
requires every public workspace to have:

- the expected name and version;
- an MIT license declaration and an exact copy of the repository license;
- a description and complete repository metadata;
- a `files: ["dist"]` allowlist and the reviewed registry destination;
- no install, prepare, or prepublish lifecycle hook;
- no source, test, coverage, environment, VCS, npm-config, or `node_modules`
  path;
- no high-confidence credential, private key, or absolute workstation path in
  packed text;
- source-map presence matching the reviewed per-package policy, with valid v3
  maps and relative source paths;
- an existing target for every declared export; and
- a successful import from an extracted, isolated consumer directory.

The UI entry points are additionally bundled through Vite from that extracted
consumer. Non-UI entry points are resolved and imported by native Node ESM. npm's
pack metadata supplies the file count, packed/unpacked size, and integrity digest
shown in the audit output.

The audit found and remediated one concrete defect: none of the seven workspace
tarballs contained the repository's MIT license text. Each workspace now carries
the canonical license so npm includes it automatically.

Recorded package shape after remediation:

| Package                        | Exports | Files | Packed KiB | Unpacked KiB |
| ------------------------------ | ------: | ----: | ---------: | -----------: |
| `@vireocodedev/history`        |       1 |    12 |       19.5 |         81.6 |
| `@vireocodedev/infrastructure` |       3 |    22 |       18.6 |         66.3 |
| `@vireocodedev/localization`   |       1 |    23 |       24.5 |         96.7 |
| `@vireocodedev/query`          |       1 |    13 |       23.5 |         87.0 |
| `@vireocodedev/shell`          |       1 |    13 |       13.7 |         50.7 |
| `@vireocodedev/sqlite`         |       2 |    49 |       59.7 |        244.4 |
| `@vireocodedev/ui`             |      13 | 1,123 |      295.6 |      1,617.7 |

Sizes are observations, not frozen budgets. The Vite-bundled packages retain
source maps with embedded public source for production debugging. Starter UI's
file-for-file output remains map-free to avoid duplicating its already-large
artifact. This decision is machine-enforced by
`contracts/package-portability-policy.json`.

Boundary, metadata, license,
integrity, and executable-consumer checks are the release gates; normal compiled
output growth should remain reviewable rather than requiring arbitrary budget
updates.

## Maven contract

`jvm/scripts/verify-publication-consumer.sh` already published all artifacts into
an isolated local Maven repository before compiling an external consumer. It now
audits that repository between those operations and requires:

- exactly the six expected `com.vireocode` modules;
- a POM and Gradle module descriptor for every module;
- binary, sources, and Javadoc JARs for each of the five code modules;
- no JAR for the BOM;
- required coordinates, description, project URL, MIT license, developer, and
  SCM metadata in every POM;
- all Gradle-generated MD5, SHA-1, SHA-256, and SHA-512 sidecars to match their
  artifacts;
- compiled classes, Java sources, and a Javadoc index in their respective JARs;
- no fat-JAR, test, source-tree, environment, or application-only directory in a
  binary JAR; and
- the repository MIT license at `META-INF/LICENSE` in every binary JAR.

The build now embeds that license in each code module. The BOM continues to carry
license metadata in its POM because it correctly has no binary artifact.

Recorded binary JAR sizes are 19–71 KiB. The audit prints each JAR's size and a
shortened SHA-256 for operator comparison while still validating the full digest
sidecars.

## Public-distribution disposition — 2026-08-27

| ID      | Severity | Finding                                                                                                                                                      | Required disposition                                                                                                                      |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| PAA-001 | Resolved | All seven canonical coordinates are public on npm at `0.2.1` with provenance attestations and anonymous consumer verification.                               | Keep the trusted-publisher-only workflow and tokenless public verification required for every release.                                    |
| PAA-002 | Resolved | All six `com.vireocode:vireo-*` artifacts are public on Maven Central at `0.2.0` with signatures/checksums and an anonymous Gradle consumer.                 | Keep signing, user-managed publication, and cold public verification required for every release.                                          |
| PAA-003 | Resolved | Release-only in-memory signing now emits and cryptographically verifies `.asc` files for every POM, Gradle module, binary, sources, and Javadoc artifact.    | Keep signing secrets environment-scoped and rerun the signed-bundle audit for every deployment.                                           |
| PAA-004 | Resolved | npm tarballs include source maps, and the UI tarball contains 1,123 compiled files because all supported subpath implementations are emitted beneath `dist`. | API growth is now governed by symbol budgets; bundled packages intentionally retain audited maps while UI remains map-free.               |
| PAA-005 | Major    | Artifact identity metadata still uses the provisional repository, developer, and copyright wording.                                                          | Update it only after the Phase 0 identity/legal-owner decisions are final, then rerun both artifact audits and clean-consumer rehearsals. |

## Gate result

The artifacts have deterministic, executable, CI-enforced content boundaries.
Maven Central and npm use separate protected release paths and separate anonymous
consumer verification. The first immutable public releases pass their registry
boundary checks. Compatibility, identity-owner wording, and recurring release
evidence remain governed separately.
