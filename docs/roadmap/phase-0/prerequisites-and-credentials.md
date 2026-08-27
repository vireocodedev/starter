# Phase 0 prerequisites and credentials baseline

Audited on 2026-08-26 at Starter commit
`9cb167cb736c9930bf85a88be725163b0453536a` and Starter Template commit
`f73df577a0568a4a6aaedb7d39b0e21c37c38160`.

This inventory distinguishes development prerequisites from credentials that exist
only because the current distribution is private. Removing avoidable credentials is
a Phase 1 requirement.

The [platform support policy](platform-support-policy.md) now defines the intended
public contract. This file remains the point-in-time implementation baseline and
therefore continues to show where repository declarations and evidence differ from
that contract.

## Toolchain

| Concern    | Starter                                       | Starter Template                                      | Baseline finding                                                                           |
| ---------- | --------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Node.js    | `>=24.15.0`                                   | `>=24.15.0`                                           | Local audit used `24.18.1`.                                                                |
| npm        | `12.0.2` package manager declaration          | `12.0.2` package manager declaration                  | Local audit used `11.16.0`; timing is diagnostic, not supported-matrix proof.              |
| Java       | 21                                            | 21                                                    | Local audit used Temurin `21.0.2`.                                                         |
| Gradle     | Wrapper `9.7.1`                               | Wrapper `9.5.1`                                       | No system Gradle is required.                                                              |
| Git        | Required                                      | Required                                              | Version policy is not yet published.                                                       |
| PostgreSQL | Docker-conditional version 17 upgrade fixture | Production database; README says 16+, Compose uses 18 | Policy targets current minors of 17 and 18; required Template/CI evidence remains.         |
| Docker     | Optional                                      | Optional for PostgreSQL and container validation      | Docker-free H2 development remains available.                                              |
| Browsers   | Storybook/browser checks                      | Playwright Chromium desktop and mobile                | Target rows are defined; Firefox, WebKit, installed PWA, and real-device evidence remains. |

Post-baseline activation: Starter now pins Node 24.18.1 and Ubuntu 24.04 in CI,
enforces npm 12.0.2 through Corepack across Turbo subprocesses, and verifies a
packed required-peer-floor consumer. Starter Template still needs the equivalent
activation before the cross-repository row is complete.

## Credential matrix

| Workflow                          | Credential today                                                   | Why                                                                                                         | Desired public state                                             |
| --------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Clone either repository           | Repository access                                                  | Both repositories are private.                                                                              | No credential for public source.                                 |
| Contributor `npm ci` in Starter   | None in the audited checkout                                       | Workspace dependencies resolve locally. Existing docs incorrectly imply a package token is always required. | No credential.                                                   |
| Starter JVM build                 | None for repository modules                                        | All modules resolve inside the included build.                                                              | No credential.                                                   |
| Starter Template frontend install | `NODE_AUTH_TOKEN` with `read:packages`                             | Vireo npm packages are private GitHub Packages.                                                             | No credential for public releases.                               |
| Starter Template JVM build        | `GITHUB_ACTOR` plus `GITHUB_TOKEN`, or Gradle `gpr.user`/`gpr.key` | Vireo Maven artifacts and BOM are private GitHub Packages.                                                  | No credential for public releases.                               |
| CI consumption of Vireo packages  | `VIREO_PACKAGES_TOKEN`                                             | Cross-repository private package access.                                                                    | Built-in public registry access without a long-lived read token. |
| Publish npm and Maven artifacts   | GitHub identity with `write:packages`                              | Current release destination is GitHub Packages.                                                             | Trusted publishing/provenance with least privilege.              |
| GitHub administration             | Maintainer repository/org permissions                              | Repository metadata, visibility, topics, security, releases, and branch protection.                         | Maintainer-only; adopters need none.                             |

An empty-cache Starter Template frontend install without a token failed with `E401`.
An empty-cache Template JVM build without a GitHub actor/token could not resolve the
BOM. These are confirmed adoption blockers, not documentation assumptions.

### Post-baseline Maven activation — 2026-08-27

- The Template JVM build now uses only `mavenCentral()` in published mode and no
  longer accepts or requires GitHub Packages credentials.
- Canonical Maven coordinates are `com.vireocode:vireo-*`; public Java packages
  are product-scoped beneath `com.vireocode.vireo.*`.
- The protected `maven-central` environment owns the four release-only secrets:
  Central username/password and in-memory signing key/passphrase.
- Release automation has read-only GitHub permissions, produces and verifies one
  signed atomic bundle, and uploads it as `USER_MANAGED`.
- The first Central publication and cold public-registry consumer run remain
  external release steps. npm credential removal is tracked separately.

### Post-baseline npm activation — 2026-08-27

- The Starter repository is public and all seven frontend packages use canonical
  `@vireocodedev/*` names, public npm metadata, and the `0.2.0` release line.
- Ordinary Starter installs, CI, package consumption, and the public verification
  workflow do not accept a GitHub Packages token.
- Changesets versioning is separated from the manual, protected publication job.
  Publication requests npm provenance and grants OIDC only to that job.
- The first publish requires one short-lived granular bootstrap token because npm
  package settings do not exist before their packages do. Afterward, every package
  must trust `release-npm.yml` with the `package-release` environment; the token is
  then removed and revoked.
- The tokenless post-release workflow waits for registry propagation, checks each
  attestation, installs from an empty cache, verifies the peer tree and public
  entry points, bundles UI, and runs `npm audit signatures`.
- The first npm publication and retained anonymous-consumer evidence remain open
  release steps. Template cannot migrate its lockfile to the new coordinates until
  those immutable versions exist publicly.

## Runtime configuration

| Variable or port             | Scope                | Purpose/default                                   |
| ---------------------------- | -------------------- | ------------------------------------------------- |
| `SPRING_DATASOURCE_URL`      | Backend              | Database JDBC URL.                                |
| `SPRING_DATASOURCE_USERNAME` | Backend              | Database user.                                    |
| `SPRING_DATASOURCE_PASSWORD` | Backend              | Database password.                                |
| `SESSION_COOKIE_SECURE`      | Backend              | Secure-cookie behavior outside local development. |
| `POSTGRES_PASSWORD`          | Compose              | PostgreSQL container password.                    |
| `VITE_API_BASE_URL`          | Frontend             | API base URL; defaults to `/api`.                 |
| `VITE_APP_NAME`              | Frontend             | Application display name.                         |
| `USE_LOCAL_STARTER`          | Template development | Select locally published Starter artifacts.       |
| `USE_LOCAL_STARTER_SOURCE`   | Template development | Select Starter source integration.                |
| `STORYBOOK`                  | Frontend tooling     | Storybook-specific runtime behavior.              |
| `CI`                         | Verification         | Enables CI-specific behavior.                     |
| `3000`                       | Frontend             | Development/preview and Playwright web server.    |
| `8080`                       | Backend              | Spring Boot and Playwright API server.            |
| `6007`                       | Storybook            | Storybook server.                                 |
| `5432`                       | PostgreSQL           | Container database port.                          |

## Documentation discrepancies found

1. Starter contributor documentation overstates the need for a GitHub Packages
   token: a clean Starter workspace install succeeded without one.
2. Starter README lists `@vireocodedev/ui` `7.0.0`; the audited package is
   `7.1.0`.
3. Starter Template compatibility documentation says UI `^7.0.0`; its dependency is
   `^7.1.0`.
4. Starter Template README says PostgreSQL 16+, while Compose currently selects
   PostgreSQL 18.
5. Starter Template `frontend/.env.example` says Spring Boot serves the production
   frontend. The deployment guide and build correctly use independent frontend and
   backend artifacts.

These are tracked in the gap register. They are not silently corrected during the
baseline because the supported-version and deployment policies remain open Phase 0
decisions.

## Clean-room evidence still required

- the Ubuntu, macOS, and Windows/WSL environments defined by the support policy;
- the declared npm 12 toolchain in Starter Template and external clean-room hosts;
- production PostgreSQL and backup/restore validation;
- Firefox, WebKit/Safari, installed PWA, and representative mobile hardware;
- credential-free installs from the intended public registries.
