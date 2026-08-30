# Phase 0 prerequisites and credentials baseline

Audited on 2026-08-26 at Starter commit
`9cb167cb736c9930bf85a88be725163b0453536a` and Starter Template commit
`f73df577a0568a4a6aaedb7d39b0e21c37c38160`.

Reconciled on 2026-08-27 at Starter
`4ff38f697403af977fd7825cbe2967c0f9968f45` and Starter Template
`ee5ecd251fa30655133e833b93de681bf2171c5c` after public distribution activation.

This inventory distinguishes adopter prerequisites from maintainer-only publishing
credentials. Public cloning and package consumption no longer require credentials.

The [platform support policy](platform-support-policy.md) now defines the intended
public contract. This file remains the point-in-time implementation baseline and
therefore continues to show where repository declarations and evidence differ from
that contract.

## Toolchain

| Concern    | Starter                                   | Starter Template                                    | Baseline finding                                                                           |
| ---------- | ----------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Node.js    | `>=24.15.0`                               | `>=24.15.0`                                         | Local audit used `24.18.1`.                                                                |
| npm        | `12.0.2` package manager declaration      | `12.0.2` package manager declaration                | Local audit used `11.16.0`; timing is diagnostic, not supported-matrix proof.              |
| Java       | 21                                        | 21                                                  | Local audit used Temurin `21.0.2`.                                                         |
| Gradle     | Wrapper `9.7.1`                           | Wrapper `9.7.1`                                     | No system Gradle is required.                                                              |
| Git        | Required                                  | Required                                            | Version policy is not yet published.                                                       |
| PostgreSQL | Docker-conditional version 17/18 fixtures | Production policy and CI use 17/18; Compose uses 18 | Policy targets current minors of 17 and 18; backup/restore evidence remains.               |
| Docker     | Optional                                  | Optional for PostgreSQL and container validation    | Docker-free H2 development remains available.                                              |
| Browsers   | Storybook/browser checks                  | Playwright Chromium desktop and mobile              | Target rows are defined; Firefox, WebKit, installed PWA, and real-device evidence remains. |

Post-baseline activation: both repositories pin Node 24.18.1 and Ubuntu 24.04 in
CI, enforce npm 12.0.2 through Corepack, use Gradle 9.7.1 wrappers, and run recurring
Java 25, PostgreSQL 17/18, browser, peer-floor, or clean-container evidence as
applicable. Broader host/device evidence remains tracked by G-112.

## Credential matrix

| Workflow                          | Credential today                                    | Why                                                                                                          | Desired public state                                  |
| --------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Clone either repository           | None                                                | Both repositories are public.                                                                                | Keep public source anonymously cloneable.             |
| Contributor `npm ci` in Starter   | None in the audited checkout                        | Workspace dependencies resolve locally. Existing docs incorrectly imply a package token is always required.  | No credential.                                        |
| Starter JVM build                 | None for repository modules                         | All modules resolve inside the included build.                                                               | No credential.                                        |
| Starter Template frontend install | None                                                | Six consumed Vireo packages resolve anonymously from public npm.                                             | Keep public npm consumption tokenless.                |
| Starter Template JVM build        | None                                                | Vireo artifacts and BOM resolve anonymously from Maven Central.                                              | Keep Maven Central consumption tokenless.             |
| CI consumption of Vireo packages  | None                                                | Both ecosystems use public registries.                                                                       | No long-lived read token.                             |
| Publish npm artifacts             | Protected GitHub OIDC identity                      | npm trusted publishing records provenance; ordinary builds receive no publish identity.                      | Maintainer-only, short-lived, least privilege.        |
| Publish Maven artifacts           | Protected Central credentials and in-memory PGP key | A protected workflow signs, stages, and optionally promotes one validated `USER_MANAGED` Central deployment. | Maintainer-only, environment-scoped, least privilege. |
| GitHub administration             | Maintainer repository/org permissions               | Repository metadata, visibility, topics, security, releases, and branch protection.                          | Maintainer-only; adopters need none.                  |

The original empty-cache failures without GitHub Packages credentials are retained
as historical evidence of the former blocker. The 2026-08-27 public-registry runs
supersede them and pass without a token.

### Post-baseline Maven activation — 2026-08-27

- The Template JVM build now uses only `mavenCentral()` in published mode and no
  longer accepts or requires GitHub Packages credentials.
- Canonical Maven coordinates are `com.vireocode:vireo-*`; public Java packages
  are product-scoped beneath `com.vireocode.vireo.*`.
- The protected `maven-central` environment owns the four release-only secrets:
  Central username/password and in-memory signing key/passphrase.
- Release automation has read-only GitHub permissions, produces and verifies one
  signed atomic bundle, and uploads it as `USER_MANAGED`. Staging is the default;
  an explicit protected workflow input can promote only the same validated UUID
  after exact six-artifact package-URL verification.
- The `0.2.0` Central publication and cold public-registry consumer run are complete.

### Post-baseline npm activation — 2026-08-27

- The Starter repository is public and all seven frontend packages use canonical
  `@vireocodedev/*` names, public npm metadata, and the `0.2.1` release line.
- Ordinary Starter installs, CI, package consumption, and the public verification
  workflow do not accept a GitHub Packages token.
- Changesets versioning is separated from the manual, protected publication job.
  Publication requests npm provenance and grants OIDC only to that job.
- The bootstrap publication is complete. Production publication now requires npm
  trusted publishing for `release-npm.yml` and the `package-release` environment;
  the workflow rejects token authentication.
- The tokenless post-release workflow waits for registry propagation, checks each
  attestation, installs from an empty cache, verifies the peer tree and public
  entry points, bundles UI, and runs `npm audit signatures`.
- The public `0.2.1` publication, provenance metadata, anonymous-consumer evidence,
  and Template lockfile migration are complete.

## Runtime configuration

| Variable or port                 | Scope                | Purpose/default                                                                              |
| -------------------------------- | -------------------- | -------------------------------------------------------------------------------------------- |
| `SPRING_DATASOURCE_URL`          | Backend              | Database JDBC URL.                                                                           |
| `SPRING_DATASOURCE_USERNAME`     | Backend              | Database user.                                                                               |
| `SPRING_DATASOURCE_PASSWORD`     | Backend              | Database password.                                                                           |
| `SESSION_COOKIE_SECURE`          | Backend              | Secure-cookie behavior outside local development.                                            |
| `POSTGRES_PASSWORD`              | Compose              | PostgreSQL container password.                                                               |
| `VITE_API_BASE_URL`              | Frontend             | API base URL; defaults to `/api`.                                                            |
| PWA identity in `pwa-policy.mjs` | Frontend             | Generated manifest/HTML identity; supersedes the baseline's former `VITE_APP_NAME` guidance. |
| `USE_LOCAL_STARTER`              | Template development | Select locally published Starter artifacts.                                                  |
| `USE_LOCAL_STARTER_SOURCE`       | Template development | Select Starter source integration.                                                           |
| `STORYBOOK`                      | Frontend tooling     | Storybook-specific runtime behavior.                                                         |
| `CI`                             | Verification         | Enables CI-specific behavior.                                                                |
| `3000`                           | Frontend             | Development/preview and Playwright web server.                                               |
| `8080`                           | Backend              | Spring Boot and Playwright API server.                                                       |
| `6007`                           | Storybook            | Storybook server.                                                                            |
| `5432`                           | PostgreSQL           | Container database port.                                                                     |

## Documentation discrepancies found

The original version, credential, PostgreSQL, and deployment-serving discrepancies
were corrected during public activation and the Phase 0 reconciliation. Automated
boundary, toolchain, package, and deployment checks now cover the checkable facts;
G-106 retains the broader executable-documentation work.

## Clean-room evidence still required

- the Ubuntu, macOS, and Windows/WSL environments defined by the support policy;
- the declared npm 12 toolchain in Starter Template and external clean-room hosts;
- production PostgreSQL and backup/restore validation;
- Firefox, WebKit/Safari, installed PWA, and representative mobile hardware;
- recurring public-registry release verification (the first cold checks pass).
