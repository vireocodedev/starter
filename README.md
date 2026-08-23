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

Note that the two halves reuse names for different things: the npm package
`@vireocodedev/starter-core` is the React app shell, whereas the Maven artifact
`com.vireocode:vireo-starter-core` is the backend's base entity/service layer.

## Frontend packages

| Package                                                           | Version | Description                                                                                                                                             |
| ----------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@vireocodedev/starter-ui`](packages/ui)                         | 2.1.0   | MUI-based component library: responsive cards, mobile tables, overlays, providers, hooks, formatters.                                                   |
| [`@vireocodedev/starter-queryengine`](packages/queryengine)       | 1.1.0   | Framework-agnostic query engine client (models, api, react-query, signals) for server-driven filtering/sorting/paging.                                  |
| [`@vireocodedev/starter-core`](packages/core)                     | 0.9.0   | App-shell framework: config/sitemap/routing scaffolding, route guards, the responsive shell + navigation, and layout presets.                           |
| [`@vireocodedev/starter-localization`](packages/localization)     | 0.8.0   | Foundation i18n toolkit + shared `platform` translations.                                                                                               |
| [`@vireocodedev/starter-sqlite`](packages/sqlite)                 | 0.5.0   | SQLite worker/client runtime primitives for offline persistence (OPFS).                                                                                 |
| [`@vireocodedev/starter-history`](packages/history)               | 1.0.0   | Framework-free entity history definitions, diff nodes, and transport-neutral record schemas.                                                            |
| [`@vireocodedev/starter-infrastructure`](packages/infrastructure) | 0.4.0   | Frontend infrastructure utilities: network status, persistent signals, date/array helpers, session-expiry events, axios helpers, tanstack query client. |

Versions above are the currently published ones; `packages/*/package.json` is the source of truth.

### Dependency graph

Only two packages depend on siblings — the rest are leaves and can be consumed on their own:

```txt
core  ->  ui, localization, infrastructure
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
npm run typecheck
npm run test
npm run build
```

### Live documentation

One repository-wide Vireo Starter Storybook hosts the complete UI component catalog and package-owned live documentation for framework-free libraries:

**[Open the Vireo Starter documentation](https://vireocodedev.github.io/starter/?path=/docs/documentation-overview--docs)**

```bash
npm run storybook
npm run build-storybook
```

Monorepo-level material lives under `Documentation`. Each library then owns a top-level section: UI contains its `Documentation`, `Core`, `Capabilities`, and `Integrations` groups, while History owns its executable package guides directly under `History`. The non-React package source remains framework-free because MDX rendering belongs to the shared UI-owned host.

Every push to `main` publishes the production Storybook to GitHub Pages. See
[Storybook deployment](docs/STORYBOOK_DEPLOYMENT.md) for repository setup,
permissions, local verification, custom-domain guidance, and failure handling.

`build` is artifact generation; `typecheck` owns full semantic source checking.
Keeping those responsibilities separate lets the UI package use TypeScript's
artifact-only emit without checking the same source graph twice. CI and the
release command always run both, followed by strict checks of the emitted
declarations.

`npm run dev` watches every package. Note that watch mode never deletes from
`dist` — deleting or renaming a source file leaves its old output behind, so take
a one-shot `npm run build` whenever a file disappears.

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

> First-time setup: run `npm install` once and commit the generated
> `package-lock.json` so CI's `npm ci` has a lockfile.

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
3. Merge to `main`. The **Release** workflow verifies the JVM source and local
   Maven publications, then publishes when the JVM version is absent from the
   registry. This is intentionally independent of whether npm packages changed;
   coordinated wire-contract changes remain a pull-request rule documented in
   `docs/BACKEND_PARITY.md`, while backend-only releases remain possible.
4. A final job resolves and tests the published artifacts from GitHub Packages
   through the checked-in standalone consumer with an empty Gradle home, so "it
   published" and "it is usable" are checked separately.

The same bump table applies. Note that MapStruct's generated `*Impl` classes are
part of the recorded surface, because they are genuinely part of the jar.

To publish from a workstation, set `gpr.user` and `gpr.key` in
`~/.gradle/gradle.properties` and run `./gradlew publish` from `jvm/`.

Run `./gradlew clean check aggregateJavadoc --no-build-cache` for the complete
source gate and `./scripts/verify-publication-consumer.sh` to prove the local
Maven publications before opening or merging a release pull request.

JVM library work follows the repository's
[JVM package-authoring](docs/package-authoring/JVM_PACKAGES.md) and
[JVM live-documentation](docs/package-authoring/JVM_LIVE_DOCUMENTATION.md)
contracts.
