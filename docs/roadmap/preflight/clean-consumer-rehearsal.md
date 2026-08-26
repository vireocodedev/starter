# Isolated consumer rehearsal

Rehearsal date: 2026-08-26

Status: **current local package consumers pass; full support-matrix clean rooms remain pending**

This checkpoint proves that the built artifacts work without workspace resolution,
source imports, or Gradle project substitution. It exercises local artifacts only;
it does not prove registry visibility, registry credentials, provenance, signing, or
the final public coordinates.

## npm consumer

`npm run release:smoke`, which is part of the authoritative TypeScript merge gate,
now performs the following clean installation:

1. packs all seven workspaces into real npm tarballs;
2. creates a temporary consumer project and a fresh npm cache;
3. pins the external runtime/peer dependencies to the exact versions installed by
   the repository lockfile;
4. installs all seven Vireo packages from `file:` tarballs with scripts disabled,
   strict peer dependency resolution, no lockfile, and no audit/funding side
   effects;
5. requires `npm ls --all` to produce a valid dependency tree;
6. rejects a Vireo package if npm installed it as a symlink or outside the temporary
   consumer;
7. compiles all 22 exported entry points with TypeScript 6, bundler module
   resolution, and `skipLibCheck: false`;
8. imports all nine framework-free entry points through native Node ESM; and
9. bundles all 13 UI entry points with the clean consumer's Vite installation.

The supported compiler profile deliberately uses TypeScript's `Bundler` resolver.
The accepted platform policy supports the Vite 8 golden path and classifies other
bundlers as untested; it does not promise NodeNext declaration resolution. Runtime
imports for framework-free packages are still exercised directly by Node.

This replaces the previous shortcut that extracted packages manually and symlinked
the monorepo's external `node_modules` into the fixture. That shortcut proved export
targets but could not expose missing peer dependencies, npm install behavior, an
invalid installed dependency tree, or accidental workspace links.

## JVM consumer

`jvm/scripts/verify-publication-consumer.sh` performs the JVM rehearsal:

1. publishes the six Maven artifacts to a new temporary file repository;
2. audits the exact repository contents and metadata;
3. invokes the independent `vireo-starter-publication-tests` Gradle build with only
   that repository admitted for `com.vireocode`;
4. imports the BOM and declares all five code modules without versions; and
5. loads one public class per module, requiring its code source to be the expected
   versioned JAR rather than a classes directory.

The independent build may reuse already-downloaded third-party artifacts from the
developer Gradle cache. That does not weaken the Vireo boundary: exclusive content
forces every `com.vireocode` resolution through the new temporary repository, and
the executable assertion rejects project/class-directory substitution. The release
workflow separately performs a post-publication run with an empty Gradle home.

## Evidence result

| Surface                  | Result | Evidence                                                                                       |
| ------------------------ | ------ | ---------------------------------------------------------------------------------------------- |
| npm tarball installation | Pass   | Seven real tarballs installed into a temporary project through a fresh npm cache               |
| npm dependency graph     | Pass   | Strict peer resolution and `npm ls --all`                                                      |
| Type declarations        | Pass   | 22 entry points, TypeScript 6, bundler resolution, `skipLibCheck: false`                       |
| Native ESM runtime       | Pass   | Nine framework-free entry points resolve inside the temporary consumer and import successfully |
| Browser bundling         | Pass   | 13 UI entry points bundle with the temporary consumer's Vite installation                      |
| Maven repository         | Pass   | Exactly six locally published modules and the enforced artifact contract                       |
| BOM/versionless use      | Pass   | Five code modules compile and test without individual versions                                 |
| JAR provenance           | Pass   | Each sampled public class loads from its expected `0.2.0` JAR                                  |

## Remaining clean-room work

- The repository currently executes npm 11 locally even though the accepted support
  floor is npm 12. Activate npm 12 in local and CI toolchain setup, then retain an
  npm 12 evidence record.
- The current npm fixture tests the exact locked dependency set. The separate
  peer-floor and admitted-range matrix required by the support policy remains a
  nightly/release follow-up.
- Canonical Ubuntu 24.04/26.04, macOS, and Windows 11/WSL2 empty-machine rehearsals
  remain recurring support evidence, not a per-commit local package check.
- Public registry rehearsals remain blocked on final npm/Maven coordinates and
  registry configuration. When available, repeat these scenarios without `file:`
  repositories and without registry credentials for public consumption.

## Gate result

The current artifacts pass isolated local consumption on both ecosystems. This
closes the monorepo-substitution risk for pull-request verification; it does not yet
activate the broader public support labels defined by D-105.
