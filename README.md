# @vireocodedev/starter

Shared libraries for the vireocodedev **starter** product, in two halves that
ship together because they live in one repository:

- `packages/*` — the frontend libraries. npm workspaces monorepo, published to
  **GitHub Packages** under the `@vireocodedev` scope.
- `jvm/*` — the Spring Boot backend libraries. A separate Gradle build,
  published as Maven artifacts under the `com.vireocode` group.

turbo never invokes Gradle and Gradle never invokes npm; CI runs them as
independent jobs. Keeping them in one repository makes a change that spans both
halves a single reviewable pull request, which is the only reason they are
neighbours. See [jvm/](jvm) and [docs/BACKEND_PARITY.md](docs/BACKEND_PARITY.md).

The frontend application-shell package is `@vireocodedev/shell`. The
Maven artifact `com.vireocode:vireo-core` is the
backend's base entity/service layer; they are separate contracts.

## Frontend packages

| Package                                                   | Version | Description                                                                                                  |
| --------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| [`@vireocodedev/ui`](packages/ui)                         | 7.0.0   | Public Vireo React components, responsive surfaces, form contracts, hooks, and Storybook infrastructure.     |
| [`@vireocodedev/query`](packages/queryengine)             | 5.0.0   | Framework-agnostic query filtering, sorting, paging, metadata, and saved-filter contracts.                   |
| [`@vireocodedev/shell`](packages/shell)                   | 4.0.0   | React application shell, initialization, sitemap, routing, responsive navigation, and page-layout contracts. |
| [`@vireocodedev/localization`](packages/localization)     | 3.0.0   | Framework-neutral localization runtime, locale definitions, regional formatting, and shared translations.    |
| [`@vireocodedev/sqlite`](packages/sqlite)                 | 3.0.0   | SQLite worker/client runtime primitives for offline persistence and synchronization.                         |
| [`@vireocodedev/history`](packages/history)               | 3.0.0   | Framework-free history record schemas, diff models, actor contracts, and transformation utilities.           |
| [`@vireocodedev/infrastructure`](packages/infrastructure) | 3.0.0   | HTTP, connectivity, persistent state, session expiry, and shared application infrastructure.                 |

Versions above are the currently published ones; `packages/*/package.json` is the source of truth.

### Dependency graph

Only two packages depend on siblings — the rest are leaves and can be consumed on their own:

```txt
shell ->  ui, localization, infrastructure
ui    ->  history, localization

history · localization · infrastructure · queryengine · sqlite   (no starter dependencies)
```

## Prerequisites

Working with (or installing) these packages requires a GitHub token with
`read:packages` (and `write:packages` to publish). The scope is wired to GitHub
Packages via [`.npmrc`](.npmrc); provide the token as `NODE_AUTH_TOKEN`:

```bash
export NODE_AUTH_TOKEN=<github-token>
```

## Develop

```bash
npm install            # installs all workspaces, generates package-lock.json
corepack npm run typecheck
corepack npm run test
corepack npm run build
corepack npm run verify          # authoritative TypeScript gate
corepack npm run verify:all      # TypeScript + JVM, including aggregate Javadoc
```

### Live documentation

One repository-wide Vireo Starter Storybook hosts the complete UI component catalog and package-owned live documentation for framework-free libraries:

**[Open the Vireo Starter documentation](https://vireocodedev.github.io/starter/?path=/docs/documentation-overview--docs)**

```bash
corepack npm run storybook
corepack npm run build-storybook
```

Monorepo-level material lives under `Documentation`. Each library then owns a top-level section: UI contains its `Documentation`, `Core`, `Capabilities`, and `Integrations` groups, while History owns its executable package guides directly under `History`. The non-React package source remains framework-free because MDX rendering belongs to the shared UI-owned host.

Every push to `main` publishes the production Storybook to GitHub Pages. See
[Storybook deployment](docs/STORYBOOK_DEPLOYMENT.md) for repository setup,
permissions, local verification, custom-domain guidance, and failure handling.

The normative [loading-state and skeleton standard](docs/LOADING_STATE_STANDARD.md)
defines loading classification, structural skeleton behavior, geometry guarantees,
accessibility, motion, and verification across Starter UI and consuming applications.
The [Phase 2 loading-state audit](docs/LOADING_STATE_AUDIT.md) records the current
Starter UI baseline and prioritized remediation queue.

`build` is artifact generation; `typecheck` owns full semantic source checking.
Keeping those responsibilities separate lets the UI package use TypeScript's
artifact-only emit without checking the same source graph twice. CI and the
release command always run both, followed by strict checks of the emitted
declarations.

`corepack npm run dev` watches every package. Note that watch mode never deletes from
`dist` — deleting or renaming a source file leaves its old output behind, so take
a one-shot `corepack npm run build` whenever a file disappears.

To try a change in a consuming app before publishing it, that app aliases the
package specifiers to these `dist` directories. The consumer side of that loop —
including why the aliases redirect the runtime but not the types — is documented
in the leather-production repository under `docs/STARTER_WORKFLOW.md`.

## Release (Changesets)

1. `npx changeset` — describe the change and pick the semver bump per package.
2. Merge to `main`. The **Release** workflow opens a "Version Packages" PR.
3. Merge that PR → the workflow builds and publishes to GitHub Packages.

Versioning is a contract per package:

| Change                                                | Bump  |
| ----------------------------------------------------- | ----- |
| Adding an export, component, prop, i18n key or locale | minor |
| Removing or renaming any of the above                 | major |
| Widening a peer dependency range                      | minor |
| Raising a peer dependency floor                       | major |
| Behaviour-preserving fixes and internal refactors     | patch |

Contract tests guard the surfaces, so a change that breaks a contract fails CI
until the bump is made deliberately rather than by accident.

> First-time setup: run `corepack npm install` once and commit the generated
> `package-lock.json` so CI's `corepack npm ci` has a lockfile.

## Release (JVM)

The `jvm/` half has no Changesets equivalent, so its release is deliberately
smaller:

1. Bump `version` in `jvm/gradle.properties` in the same pull request as the
   change that warrants it. One version covers all six artifacts — they are a
   set, and the BOM exists so a consumer never mixes them.
2. If the change moved the public API, run `./gradlew apiSurfaceUpdate` in `jvm/`
   and commit the updated `api-surface.txt` files. This is the forcing function:
   the check task fails the build until the snapshot matches, so a widened
   surface always shows up in the diff next to the version bump.
3. Merge to `main`, then manually run **Stage Maven Central release** with the
   exact version. The protected `maven-central` environment builds one signed,
   audited bundle, uploads it as a `USER_MANAGED` deployment, and waits for
   Central validation. It does not publish automatically.
4. Review the validated deployment in Central Portal and explicitly publish it.
   Then run **Verify Maven Central release** for the same version. That workflow
   resolves the public BOM and every versionless module through the checked-in
   standalone consumer with an empty Gradle home, so "it published" and "it is
   usable" are checked separately.

The same bump table applies. Note that MapStruct's generated `*Impl` classes are
part of the recorded surface, because they are genuinely part of the jar.

Run `./gradlew clean check aggregateJavadoc --no-build-cache` for the complete
source gate and `./scripts/verify-publication-consumer.sh` to prove the local
Maven publications before opening or merging a release pull request.

The complete credential, signing, staging, manual-publication, and recovery
procedure is in [Maven Central release](docs/MAVEN_CENTRAL_RELEASE.md).

JVM library work follows the repository's
[JVM package-authoring](docs/package-authoring/JVM_PACKAGES.md) and
[JVM live-documentation](docs/package-authoring/JVM_LIVE_DOCUMENTATION.md)
contracts.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) for the supported toolchain and pull
request gate. Please report vulnerabilities according to
[SECURITY.md](SECURITY.md), rather than opening a public issue.
