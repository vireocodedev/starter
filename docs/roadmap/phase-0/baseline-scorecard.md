# Phase 0 baseline scorecard

Audited on 2026-08-26 at Starter commit
`9cb167cb736c9930bf85a88be725163b0453536a` and Starter Template commit
`f73df577a0568a4a6aaedb7d39b0e21c37c38160`.

This is a point-in-time reconciliation against the entire master roadmap. `Partial`
does not mean low quality; it means the roadmap's complete proof or adoption
contract is not yet satisfied.

## Executive baseline

Vireo already has unusually strong internal engineering foundations: versioned
TypeScript and JVM libraries, machine-checked public API surfaces, comprehensive
repository verification, responsive UI contracts, loading-state standards, a real
full-stack Template slice, release automation, and publication-consumer tests.

It is not yet a public product. Both repositories and every audited package are
private, external positioning and onboarding have not been validated, the minimal
Template boundary is unresolved, the public support matrix is defined but not yet
enforced, and the create/doctor/full-stack generation experience does not exist.
Those dependencies make Phase 0 and public-foundation work more important than
adding breadth.

## Roadmap coverage

| Roadmap section                                             | Status           | Evidence and missing proof                                                                                                                                                                                                    |
| ----------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Purpose and definition of success                        | Partial          | The roadmap defines outcomes; telemetry, baselines, and public-adoption evidence do not exist.                                                                                                                                |
| 2. Current baseline and strategic interpretation            | Partial          | This evidence set establishes the first reproducible audit. Supported OS/browser clean rooms and human studies remain.                                                                                                        |
| 3. Product strategy and positioning                         | Needs validation | A precise persona, job, claim hierarchy, non-goals, scale envelope, and test protocol now exist; no unfamiliar-user session has validated them.                                                                               |
| 4. Naming, brand, identity, and discoverability             | Partial          | A qualified [working identity, collision report, public-coordinate policy, and migration plan](identity-and-coordinates.md) are approved; domain acquisition, professional clearance, and public discovery surfaces remain.   |
| 5. Repository and project topology                          | Partial          | Canonical [framework, Template, deferred-examples, ownership, release, transition, and reversal boundaries](repository-topology.md) are approved; external renames, archival, and contributor validation remain.              |
| 6. Framework contract and extension model                   | Partial          | Published packages and replaceable Template adapters demonstrate a kernel, but capability, extension, and escape-hatch policy is not one explicit contract.                                                                   |
| 7. CLI and project creation experience                      | Missing          | Generator lists only `react-component`; no create, doctor, or upgrade workflow.                                                                                                                                               |
| 8. Vertical-slice and code generation                       | Missing          | The Item slice is handwritten; no safe full-stack entity or workflow generator exists.                                                                                                                                        |
| 9. End-to-end type and wire-contract strategy               | Partial          | History has a shared JSON fixture; a comprehensive schema and drift policy are absent.                                                                                                                                        |
| 10. Frontend architecture and runtime                       | Strong partial   | Provider composition, state boundaries, lazy routes, errors, loading, and bundle checks are mature; public runtime/performance proof remains.                                                                                 |
| 11. UI system and visual quality                            | Strong partial   | Starter UI has deep component, motion, loading, responsive, and authoring contracts; external use and deliberate surface review remain.                                                                                       |
| 12. Accessibility and inclusive design                      | Partial          | Storybook a11y is configured to error; browser, assistive-technology, and manual audit coverage is incomplete.                                                                                                                |
| 13. Forms, validation, and workflow UX                      | Partial          | Starter UI and Template demonstrate forms; generated cross-stack validation and error contracts are not standardized end to end.                                                                                              |
| 14. PWA platform quality                                    | Partial          | PWA shell and browser examples exist; install, update, and lifecycle proof across the supported browser/device matrix is missing.                                                                                             |
| 15. Offline-first architecture and synchronization          | Strong partial   | Offline and SQLite libraries plus Template scenarios are substantial; explicit guarantees, conflict policy, and device proof remain.                                                                                          |
| 16. Backend framework quality                               | Strong partial   | JVM modules cover core, auth, query, offline, and history with migrations and consumer checks; operations and public support proof remain.                                                                                    |
| 17. Authentication, authorization, sessions, and tenancy    | Partial          | JVM auth plus Template security/session integration exist; tenancy policy, threat model, reference IdP path, and external review remain.                                                                                      |
| 18. Query engine, search, filters, and saved views          | Strong partial   | TypeScript/JVM query engines and Template filter adapters are real; saved-view, generation, and scale contracts need proof.                                                                                                   |
| 19. History, audit, privacy, and data governance            | Strong partial   | TypeScript/JVM history libraries, Template integration, fixtures, and tests exist; privacy/governance contracts and production proof remain.                                                                                  |
| 20. Localization and internationalization                   | Strong partial   | A substantial localization package and Template integration exist; locale policy, extraction workflow, and external validation remain.                                                                                        |
| 21. Testing and quality strategy                            | Strong partial   | Unit, integration, Storybook, E2E, API, architecture, consumer, and JVM checks are mature; OS/browser/device/visual matrices and budgets remain.                                                                              |
| 22. Security engineering and software supply chain          | Partial          | Security policy and automated scans are partial; threat modeling, action pinning, SBOM/provenance, hardening, and independent review remain.                                                                                  |
| 23. Packaging, versioning, compatibility, and releases      | Partial          | Changesets, JVM versioning, release-pack smoke, publication consumers, fixtures, and [platform lifecycle windows](platform-support-policy.md) exist; public trusted releases and artifact-level compatibility policy remain.  |
| 24. Documentation information architecture                  | Partial          | Extensive package and Template docs exist; version, deployment, and credential drift plus comprehensive executable-doc coverage remain.                                                                                       |
| 25. README and GitHub conversion surface                    | Partial          | READMEs and community files exist; private repos, stale metadata, and no public conversion/quick-start proof prevent completion.                                                                                              |
| 26. Demo and proof applications                             | Partial          | Template is a rich proof application, but it is private, unhosted, and its minimal-versus-kitchen-sink boundary is unresolved.                                                                                                |
| 27. Developer experience beyond the happy path              | Partial          | Errors, async states, local-source modes, and extensive examples exist; doctor, upgrade, recovery diagnostics, and unfamiliar-user proof do not.                                                                              |
| 28. Deployment and production operations                    | Partial          | Independent frontend/backend artifacts, container, health check, and deployment guide exist; canonical hosting, observability, and runbooks remain.                                                                           |
| 29. Browser, platform, and compatibility policy             | Partial          | An explicit [toolchain, OS, browser, installed-PWA, lifecycle, and evidence policy](platform-support-policy.md) is approved; most cross-platform, database, browser, and device lanes are not implemented.                    |
| 30. Open-source governance and community health             | Missing          | Community basics exist, but `SUPPORT.md`, `GOVERNANCE.md`, issue forms, response policy, and public ownership model do not.                                                                                                   |
| 31. Legal, licensing, intellectual property, and compliance | Partial          | MIT license, security policy, contributor code of conduct, and [preliminary naming-collision evidence](identity-and-coordinates.md) exist; professional clearance, dependency-license policy, and compliance guidance remain. |
| 32. Website, content, and education                         | Missing          | Repository Markdown and generated Javadocs exist; no public site, domain, searchable guides, or education cadence.                                                                                                            |
| 33. Launch and growth strategy                              | Missing          | The roadmap proposes stages, but there is no public alpha, launch package, distribution experiment, or adoption evidence.                                                                                                     |
| 34. Product analytics, research, and feedback loops         | Missing          | No privacy-respecting activation telemetry, research cadence, target-developer interviews, or feedback taxonomy is recorded.                                                                                                  |
| 35. Maintainer sustainability and project economics         | Missing          | No published support capacity, funding model, bus-factor plan, or maintenance-cost baseline.                                                                                                                                  |
| 36. Competitive strategy and recurring review               | Partial          | A current official-source outcome matrix exists; hands-on scenario results and a sustained twice-yearly review remain.                                                                                                        |

Sections 37–43 of the roadmap define execution, gates, risks, definition of done,
and references rather than additional product surfaces. The
[execution plan](../execution-plan.md), [decision queue](decisions.md), and
[gap register](gap-register.md) now provide the operational layer, but no roadmap
phase gate has yet been passed.

## Public API inventory

The exhaustive, machine-checked names remain in each package/module snapshot.
Counts below make scope and compatibility cost visible without creating a duplicate
manual API list.

### TypeScript packages

| Package                                | Version | Entry points | Named exports | Worker-safe entry points |
| -------------------------------------- | ------: | -----------: | ------------: | -----------------------: |
| `@vireocodedev/starter-history`        |   3.0.0 |            1 |            35 |                        1 |
| `@vireocodedev/starter-infrastructure` |   3.0.0 |            3 |            41 |                        2 |
| `@vireocodedev/starter-localization`   |   3.0.0 |            1 |            42 |                        1 |
| `@vireocodedev/starter-queryengine`    |   5.0.0 |            1 |            60 |                        1 |
| `@vireocodedev/starter-shell`          |   4.0.0 |            1 |            49 |                        1 |
| `@vireocodedev/starter-sqlite`         |   3.0.0 |            2 |           154 |                        2 |
| `@vireocodedev/starter-ui`             |   7.1.0 |           13 |         1,364 |                        0 |
| **Total**                              |         |       **22** |     **1,745** |                    **9** |

UI accounts for about 78% of the named TypeScript surface. That may be justified by
the component catalog, but it is a material documentation and semantic-versioning
obligation.

### JVM modules

| Module                      | Public/protected types | Recorded members/signatures |
| --------------------------- | ---------------------: | --------------------------: |
| `vireo-starter-auth`        |                     13 |                          90 |
| `vireo-starter-core`        |                     29 |                         124 |
| `vireo-starter-history`     |                      7 |                          31 |
| `vireo-starter-offline`     |                     29 |                         202 |
| `vireo-starter-queryengine` |                     33 |                         226 |
| **Total**                   |                **111** |                     **673** |

The BOM intentionally has no type surface.

## Verification and artifact baseline

Audit host: Linux `6.8.0-138-generic` x86_64, Intel i9-13900HX, 32 logical CPUs,
31 GiB RAM. Local npm was 11.16.0, so results are diagnostic until repeated on the
approved matrix.

| Measurement                                          |                           Result | Notes                                                                                |
| ---------------------------------------------------- | -------------------------------: | ------------------------------------------------------------------------------------ |
| Starter empty-cache npm install                      |                           9.60 s | Max RSS 510 MiB; zero audit vulnerabilities.                                         |
| Starter forced TypeScript package build              |                           4.98 s | Max RSS 539 MiB.                                                                     |
| Starter authoritative TypeScript verification        |                         109.41 s | All eight stages passed; max RSS 6.96 GiB; tests/contracts were slowest at 49.974 s. |
| Starter cold JVM clean build plus aggregate Javadocs |                          96.74 s | Fresh Gradle home, no build cache; max RSS 1.41 GiB.                                 |
| Starter Template empty-cache npm install             |                          10.12 s | Max RSS 550 MiB; zero audit vulnerabilities.                                         |
| Starter Template authoritative verification          |                         112.00 s | Frontend 90.736 s, browser 20.563 s, JVM 0.677 s; max RSS 4.02 GiB.                  |
| Starter Template cold JVM clean build                |                         141.15 s | Fresh Gradle home; private package credentials required; max RSS 1.06 GiB.           |
| Template frontend JS                                 | 2,294,984 B raw / 678,899 B gzip | 60 chunks; largest chunk 666,548 B raw / 192,416 B gzip.                             |
| Template frontend complete `dist`                    |                      2,546,401 B | Includes JS, CSS, and static output.                                                 |
| Template executable backend JAR                      |                     68,333,016 B | Plain JAR is 23,410 B.                                                               |
| Template container image                             |                    360,365,917 B | Backend-only runtime image.                                                          |
| Template Docker build context                        |                         168.1 MB | Build directory is sent because the Dockerfile copies the JAR.                       |
| Template container health readiness                  |                         5,838 ms | Production profile with H2 for this smoke measurement.                               |

Packed npm artifacts range from 13,364 B (`starter-shell`) to 301,970 B
(`starter-ui`). JVM main JARs range from 18,408 B (`history`) to 71,062 B
(`queryengine`). No tracked generated build outputs were found in either repository.

## Test and documentation shape

- Starter has per-package unit/contract tests across all seven TypeScript packages;
  Starter UI additionally has 126 test files and 85 Storybook stories.
- JVM modules contain 36 test source files across core, auth, queryengine, offline,
  and history.
- Starter Template contains 17 unit test files, 13 integration test files, three
  Playwright E2E files, four stories, and three backend test files.
- Playwright currently exercises desktop and mobile Chromium only.
- Storybook accessibility checks are configured as errors.
- Loading geometry has bespoke regression contracts, but there is no general visual
  regression service or cross-browser screenshot matrix.

## Unmeasured baseline

The audit intentionally records these as missing rather than inventing results:

- Lighthouse and Core Web Vitals;
- representative low-end Android performance;
- Firefox, WebKit/Safari, iOS, and installed-PWA behavior;
- Windows, macOS, and WSL clean-room setup;
- production PostgreSQL deployment, upgrade, backup, and restore;
- public demo uptime and reliability;
- unfamiliar-user time to first success and time to first domain change.

The prioritized work needed to close these gaps is in
[the gap register](gap-register.md).
