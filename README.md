# Vireo Framework · by Vireo Code

Vireo is an opinionated foundation for teams building operational business
applications with React, with a complete Spring Boot golden path when the same team
owns both halves. It supplies reusable responsive UI, adapters, cross-stack
contracts, history, localization, and offline building blocks while leaving
applications as ordinary React and, when selected, Spring Boot code.

The application team owns its domain model, authorization policy, data sensitivity,
offline eligibility, and conflict resolution. Vireo's offline packages provide
mechanisms for selected disconnected workflows; they do not make arbitrary business
logic synchronize safely. The exact primitive guarantees, conflict ownership, and
adversarial admission checklist are in
[`docs/OFFLINE_GUARANTEES.md`](docs/OFFLINE_GUARANTEES.md). See the public
[Vireo Starter Template](https://github.com/vireocodedev/starter-template) for the
current runnable full-stack composition.

This public `0.x` line is production-shaped, not a production-readiness claim. Project
creation, doctor diagnostics, and target-aware entity generator are implemented.
The standalone frontend profile is public in `create-vireo@0.4.0`. Its version-aware
project upgrade currently supports the explicit 0.2.0→0.3.0 release pair.

## Start here

Choose the shortest path that matches what you are evaluating:

| Goal                            | First step                                                                                 | Expected result                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Evaluate the complete stack     | Follow the [guided evaluation](docs/EVALUATION.md) in the public Template                  | A running authenticated Item workflow backed by React and Spring Boot     |
| Create a standalone frontend    | Run `npm create vireo@latest app -- --profile frontend`                                    | A mock-backed React app with no Java or database                          |
| Adopt into an existing frontend | Read the [frontend-only profile](docs/architecture/frontend-only-profile.md)               | Vireo packages and adapters introduced behind an owned API boundary       |
| Adopt frontend building blocks  | Review the [npm entry points](docs/PUBLIC_API.md#frontend-entry-points) and live Storybook | A deliberate package/subpath choice rather than an accidental deep import |
| Adopt backend building blocks   | Review the [Maven modules](docs/PUBLIC_API.md#jvm-entry-points) and BOM example            | Version-aligned Spring Boot modules resolved from Maven Central           |
| Assess fit before installing    | Read [where Vireo fits](docs/EVALUATION.md#fit-and-limitations)                            | An explicit decision based on current `0.x` capabilities and limitations  |

The [public API map](docs/PUBLIC_API.md) is the package-level navigation surface.
Starter UI has an additional [classified surface](packages/ui/docs/PUBLIC_SURFACE.md)
covering every exported entry point. Canonical date, time, and timestamp ownership is
documented in the [temporal values guide](docs/TEMPORAL_VALUES.md).

The framework libraries live in two halves:

- `packages/*` — the frontend libraries. npm workspaces monorepo, published as
  public npm packages under the `@vireocodedev` scope.
- `jvm/*` — the Spring Boot backend libraries. A separate Gradle build,
  published as Maven artifacts under the `com.vireocode` group.

turbo never invokes Gradle and Gradle never invokes npm; CI runs them as
independent jobs. Keeping them in one repository makes a change that spans both
halves a single reviewable pull request, which is the only reason they are
neighbours. See [jvm/](jvm) and [docs/BACKEND_PARITY.md](docs/BACKEND_PARITY.md).

The frontend application-shell package is `@vireocodedev/shell`. The
Maven artifact `com.vireocode:vireo-core` is the
backend's base entity/service layer; they are separate contracts.

Public-beta evaluation is open, but readiness and independent adoption are not yet claimed. Use the structured [feedback and aggregate-evidence path](docs/roadmap/phase-5/feedback-and-evidence.md); do not treat downloads, automation, or the maintainer-built flagship as adopter evidence.

## Frontend packages

| Package                                                   | Version | Description                                                                                               |
| --------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| [`create-vireo`](packages/create-vireo)                   | 0.4.0   | Project creation/upgrade plus full-stack and frontend-target entity, contract-check, and ejection CLI.    |
| [`@vireocodedev/ui`](packages/ui)                         | 0.2.2   | Public Vireo React components, responsive surfaces, form contracts, hooks, and Storybook infrastructure.  |
| [`@vireocodedev/query`](packages/queryengine)             | 0.2.1   | Framework-agnostic query filtering, sorting, paging, metadata, and saved-filter contracts.                |
| [`@vireocodedev/shell`](packages/shell)                   | 0.2.1   | Framework-free sitemap, navigation, authentication-redirect, and browser overlay-history contracts.       |
| [`@vireocodedev/localization`](packages/localization)     | 0.2.1   | Framework-neutral localization runtime, locale definitions, regional formatting, and shared translations. |
| [`@vireocodedev/sqlite`](packages/sqlite)                 | 0.2.1   | SQLite worker/client runtime primitives for offline persistence and synchronization.                      |
| [`@vireocodedev/history`](packages/history)               | 0.2.1   | Framework-free history record schemas, diff models, actor contracts, and transformation utilities.        |
| [`@vireocodedev/infrastructure`](packages/infrastructure) | 0.2.1   | HTTP, connectivity, persistent state, session expiry, and shared application infrastructure.              |

Versions above are the current package lines. `packages/*/package.json` remains the source of truth.

### Dependency graph

Only UI depends on sibling Vireo packages. The other seven can be consumed on their own:

```txt
ui -> history, infrastructure, localization, query

create-vireo · history · infrastructure · localization · query · shell · sqlite   (no Vireo dependencies)
```

## Prerequisites

Node.js, npm, Java, and Gradle versions are declared and checked by the repository.
Installing the public npm and Maven packages requires no Vireo or GitHub
credential. Publishing is maintainer-only and isolated behind protected GitHub
environments. Current supported, compatible, experimental, and untested rows are in
the machine-enforced [platform matrix](docs/PLATFORM_SUPPORT.md).
Verification duration, peak-RSS thresholds, evidence retention, and exception rules
are defined by the [performance policy](docs/VERIFICATION_PERFORMANCE.md).

## Develop

```bash
corepack npm ci         # installs the reviewed workspace lockfile
corepack npm run typecheck
corepack npm run test
corepack npm run build
corepack npm run verify          # authoritative TypeScript gate
corepack npm run verify:all      # TypeScript + JVM, including aggregate Javadoc
```

### Live documentation

The public Vireo documentation portal searches the complete Storybook guide and
component catalog together with generated TypeScript and JVM API references:

**[Open the Vireo Starter documentation](https://vireocodedev.github.io/starter/docs/)**

```bash
corepack npm run storybook
corepack npm run build-storybook
corepack npm run build-docs
```

Monorepo-level material lives under `Documentation`. Each library then owns a top-level section: UI contains its `Documentation`, `Core`, `Capabilities`, and `Integrations` groups, while History owns its executable package guides directly under `History`. The non-React package source remains framework-free because MDX rendering belongs to the shared UI-owned host.

Every push to `main` publishes the complete production documentation artifact to
GitHub Pages. See [documentation deployment](docs/STORYBOOK_DEPLOYMENT.md) for
repository setup, permissions, local verification, custom-domain guidance, and
failure handling.
The [documentation portal contract](docs/DOCUMENTATION_PORTAL.md) defines search,
version-specific routes, generated API references, and release linkage.

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

1. `corepack npm exec changeset` — describe the change and select each package's
   semver bump.
2. Merge to `main`. **Maintain npm release PR** opens or refreshes the version PR.
3. Review and merge that PR. This updates versions and changelogs but does not
   publish.
4. Manually run **Publish npm release** on `main`, enter `publish`, and approve
   the protected `package-release` environment.
5. Require the automatic **Verify public npm release** workflow to pass its
   anonymous cold-consumer and provenance checks.

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

The complete bootstrap, trusted-publisher, publication, verification, and
recovery procedure is in [Public npm release](docs/NPM_RELEASE.md).

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
request gate. Public support and issue boundaries are in [SUPPORT.md](SUPPORT.md),
project decision authority is in [GOVERNANCE.md](GOVERNANCE.md), and release and
upgrade promises are in the [compatibility policy](docs/COMPATIBILITY.md). Please
report vulnerabilities according to [SECURITY.md](SECURITY.md), rather than
opening a public issue.
