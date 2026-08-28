# Public documentation portal

The public Vireo documentation entry point is
<https://vireocodedev.github.io/starter/docs/>. It combines the existing
Storybook catalog with generated TypeScript and JVM API references instead of
replacing the package-owned guides that already exist.

## Published surfaces

| Stable route                                                                 | Content                                         |
| ---------------------------------------------------------------------------- | ----------------------------------------------- |
| [`/docs/`](https://vireocodedev.github.io/starter/docs/)                     | Current release landing page and unified search |
| [`/latest/`](https://vireocodedev.github.io/starter/latest/)                 | Alias for the current release snapshot          |
| [`/api/typescript/`](https://vireocodedev.github.io/starter/api/typescript/) | Current TypeScript API reference                |
| [`/api/jvm/`](https://vireocodedev.github.io/starter/api/jvm/)               | Current aggregate JVM Javadocs                  |
| [`/versions/`](https://vireocodedev.github.io/starter/versions/)             | Available documentation releases                |
| [`/versions.json`](https://vireocodedev.github.io/starter/versions.json)     | Machine-readable release index                  |

The release-specific route is
`/versions/npm-0.2.1_jvm-0.2.0/`. npm and JVM versions are deliberately shown
separately because their release lines are independent. Exact versions for all npm
packages are recorded in `versions.json`; the route identifies the documentation
release rather than requiring every package to share one version.

The unified search index includes:

- every Storybook guide, component documentation page, and example;
- every export from the checked TypeScript `api-surface.json` snapshots, with the
  declaration emitted for its public package entry point; and
- every public aggregate-Javadoc type and member.

Package export maps, TypeScript API snapshots, emitted declarations, Java source,
and aggregate Javadoc remain the authorities. The portal only derives navigation
and presentation from those checked sources.

## Version contract

[`documentation-release-policy.json`](../contracts/documentation-release-policy.json)
declares the current documentation release, exact npm package versions, coordinated
JVM family version, published modules, and registry/source/migration links. The
documentation policy fails when those values drift from package manifests or
`jvm/gradle.properties`.

Only the latest npm and JVM lines receive support. A release-specific URL identifies
the artifact pair described by a documentation snapshot; it does not imply that npm
and JVM use one shared version.

When a new documentation release becomes current:

1. retain the prior release entry in the policy;
2. retain its generated snapshot as a source-owned historical archive before the
   stable aliases move;
3. update all changed package/JVM versions and release links;
4. build and verify the new snapshot; and
5. publish only after its corresponding registry artifacts are public.

Historical release entries must provide a complete archive, so a later Pages deploy
cannot silently turn an old release URL into the new API. The first public
documentation release has no predecessor to archive.

## Local build and verification

Build the complete Pages artifact:

```bash
corepack npm run build-docs
```

That command builds all npm declarations, Storybook, aggregate Javadocs, the
release-specific portal, and the artifact contract. If the package and Storybook
outputs already exist, rebuild only the assembled portal with:

```bash
./jvm/gradlew -p jvm aggregateJavadoc
corepack npm run docs:portal
corepack npm run docs:check:artifact
```

The generated site remains ignored at `packages/ui/storybook-static`. It is never a
source of release truth and is not committed.

## Deployment contract

Every push to `main` runs the Pages workflow. The workflow builds package
declarations and Storybook, compiles aggregate Javadocs, assembles the versioned
portal, validates all searchable targets, and uploads one static artifact. A failed
build or policy check cannot replace the current public deployment.
