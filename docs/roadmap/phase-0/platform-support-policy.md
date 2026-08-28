# Phase 0 platform support and lifecycle policy

Decision date: 2026-08-26

Evidence reconciled: 2026-08-27

Decision: D-105

Status: policy accepted; the narrower current public-alpha matrix was activated on
2026-08-27 and closes G-112

This policy defines the initial Vireo Framework support contract. It deliberately
separates the contract we intend to publish from the smaller set continuously
verified today. A target row is not publicly **supported** until all activation
evidence in this document is green.

The live evidence-backed subset is the versioned
[current platform support matrix](../../PLATFORM_SUPPORT.md). Its machine-readable
policy is authoritative for current labels; rows below that remain manual or
untested are not public support claims.

## Status vocabulary

| Label            | Contract                                                                                                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Supported**    | Continuously verified at the stated cadence. A reproducible defect inside the documented contract is release-blocking or receives a published remediation decision.                                   |
| **Compatible**   | Expected to work and allowed by upstream/runtime constraints, with periodic evidence or a known supported foundation, but not in every release gate. Fixes are best-effort until the row is promoted. |
| **Experimental** | Opt-in evaluation surface. Behavior, configuration, and availability may change in a minor or prerelease after release notes. It cannot carry a production-readiness claim.                           |
| **Untested**     | No evidence-backed claim. It may work, but failures do not create a compatibility obligation.                                                                                                         |
| **Unsupported**  | Below a documented floor, upstream-EOL, known incompatible, or explicitly outside scope. No compatibility fix is promised.                                                                            |

“Supported” is an evidence state, not a synonym for “the dependency accepts this
version.” Upstream compatibility is necessary but insufficient.

## Initial public-alpha toolchain contract

All ranges include the newest security/bug-fix patch in the admitted line. Exact
versions remain locked for reproducible repository builds.

| Surface             | Supported target                                                                       | Compatible or experimental                                                                                 | Untested or unsupported                                                                                   | Rationale                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Node.js             | `>=24.15.0 <25`, latest 24.x patch                                                     | Node 26 becomes experimental after it enters LTS and may be promoted after the admission suite             | Odd-numbered, Current, below-floor, and EOL lines are unsupported                                         | Node 24 is Active LTS through 2026-10-20 and EOL is scheduled for 2028-04-30                                                       |
| npm                 | `>=12.0.2 <13`, repository-declared exact version in CI                                | None initially                                                                                             | npm 11 is diagnostic only after npm 12 activation; other package managers are untested                    | npm has no LTS line, and npm 12 requires Node `^24.15.0` among its supported runtimes                                              |
| Java                | Java 21 LTS, latest Temurin security update; source/bytecode level 21                  | Java 25 LTS runtime is compatible only after a recurring runtime suite passes; compilation remains 21      | Non-LTS JDKs and Java below 21 are unsupported                                                            | Java 21 is the established compilation floor; Spring Boot and Gradle allow later runtimes without requiring a newer bytecode floor |
| Spring Boot         | `>=4.1.1 <4.2`, aligned through the Vireo BOM                                          | A future stable minor is experimental until migration, consumer, and Template suites pass                  | Boot 3.x, milestones, release candidates, snapshots, and unlisted future minors are unsupported           | The current libraries and Template are built against Boot 4.1.1; Boot documents Java 17–26 and Gradle 8.14+/9.x compatibility      |
| Gradle              | Checked-in wrapper only; each repository pins an admitted Gradle 9.x patch             | A wrapper upgrade is experimental on its update branch                                                     | System Gradle and wrappers outside the committed version are untested                                     | Consumers should not install Gradle; the wrapper is the reproducibility boundary                                                   |
| React / React DOM   | `>=19.2 <20`, identical versions                                                       | None initially                                                                                             | React 18 and future majors are untested despite the current broad peer range                              | The repository and Template verify React 19.2; upstream lists 19.2 as the current documented line                                  |
| Material UI         | `@mui/material`, icons, and X date pickers `>=9 <10`, on compatible 9.x patches        | None initially                                                                                             | MUI 7 LTS and future majors are untested for Vireo                                                        | MUI 9 is the current stable major and MUI 7 receives upstream LTS fixes, but Vireo verifies only 9                                 |
| TypeScript          | `>=6.0 <7` for application compilation and declaration consumers                       | Native/compiler previews remain experimental tooling only                                                  | Earlier majors and TypeScript 7 until admitted are untested                                               | Public declarations must pass the supported compiler rather than merely compile in the workspace                                   |
| Vite                | `>=8 <9` in the golden-path Template                                                   | Not a runtime requirement for non-UI library consumers                                                     | Other bundlers are untested unless a package explicitly documents them                                    | Vite is Template tooling, not an application runtime abstraction promised by every package                                         |
| PostgreSQL          | Major 17 and 18, always at the latest available minor                                  | New stable major is experimental until migrations, query semantics, backup/restore, and upgrade tests pass | PostgreSQL 16 and earlier, prereleases, extensions, and managed-service deviations are untested initially | PostgreSQL supports each major for five years and recommends the current minor; 17 and 18 are current and narrow enough to verify  |
| H2                  | Development and automated-test profile only, version supplied by the admitted Boot BOM | None                                                                                                       | Production H2 is unsupported                                                                              | H2 optimizes fast local feedback and is not evidence for PostgreSQL production behavior                                            |
| Browser SQLite/Wasm | Version selected by the supported Vireo SQLite package and lockfile                    | OPFS and advanced persistence paths are experimental until their browser/device rows pass                  | Native SQLite ABI compatibility is out of scope                                                           | Browser persistence is a package feature, not the server database contract                                                         |

Package manifests, BOMs, generated projects, docs, and CI must not advertise wider
ranges than this matrix. A package may declare a narrower range when its own contract
requires it.

## Development, build, and deployment operating systems

| Surface                        | Supported target                                                                       | Compatible                                         | Untested or unsupported                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Canonical CI and release build | Ubuntu 24.04 LTS, x86-64, pinned runner image                                          | Ubuntu 26.04 LTS after a nightly lane passes       | Floating `ubuntu-latest` as the sole evidence source is insufficient                                     |
| Linux developer clean room     | Ubuntu 24.04 and 26.04 LTS, x86-64                                                     | Other current glibc-based distributions            | Interim/EOL distributions and musl-only hosts are untested unless containerized                          |
| macOS developer clean room     | Current and previous generally available macOS major, Apple silicon                    | Intel macOS while vendor-supported                 | Older/EOL macOS is unsupported; CI evidence from Linux WebKit does not prove Safari/macOS behavior       |
| Windows developer clean room   | Vendor-supported Windows 11 using WSL2 with an admitted Ubuntu LTS                     | Native Windows for isolated npm/Gradle commands    | Native Windows is not a golden-path environment until all lifecycle commands have native wrappers and CI |
| Reference backend deployment   | Published OCI image on Linux x86-64                                                    | Direct Java 21 deployment on a supported Linux LTS | Linux ARM64, Windows Server, native images, Kubernetes, and other orchestrators are untested initially   |
| Reference frontend deployment  | Standards-compliant static HTTPS host/CDN with SPA fallback and documented API routing | Same-origin serving by an adopter-owned gateway    | Spring Boot classpath serving is not the default contract                                                |

For browser users, the browser matrix—not the developer OS matrix—defines support.
Vendor-supported OS versions are required even if a browser still launches on an
EOL operating system.

## Browser-tab support target

The version window rolls with vendor stable releases; it is evaluated on every
Playwright/browser update and at least monthly.

| Platform                | Supported target                                             | Required proof                                                                                          |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Google Chrome desktop   | Stable and previous stable major                             | Playwright Chromium on each PR plus branded Chrome Stable and previous-major evidence before release    |
| Microsoft Edge desktop  | Stable and previous stable major                             | Branded Edge Stable and previous-major evidence before release; shared Chromium engine suite on each PR |
| Mozilla Firefox desktop | Stable and current ESR                                       | Playwright Firefox nightly and before release; manual stable/ESR smoke at least monthly                 |
| Safari on macOS         | Current and previous Safari major on vendor-supported macOS  | Playwright WebKit on macOS plus real Safari smoke before release                                        |
| Chrome on Android       | Stable and previous stable major on vendor-supported Android | Mobile Chromium emulation on each PR and representative physical-device smoke before release            |
| Safari on iPhone/iPad   | Current and previous generally available iOS/iPadOS major    | Playwright WebKit mobile profiles plus representative physical-device smoke before release              |

Samsung Internet, embedded webviews, in-app browsers, enterprise-modified browser
builds, beta/dev/canary channels, and browsers outside these windows begin as
untested. Chrome/Edge Beta may run as an advisory early-warning lane but never
substitutes for Stable evidence.

## Installed-PWA support target

Installed mode is a separate contract from browser-tab rendering:

| Platform                                          | Target status                                                                               | Contract                                                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Chrome desktop and Android                        | Supported after release and physical-device install/update/offline/recovery evidence passes | Manifest recognition, install, standalone launch, navigation, update, and uninstall/reinstall recovery |
| Edge desktop                                      | Supported after the same release evidence passes                                            | Same contract as Chrome, verified in branded Edge rather than inferred from Chromium                   |
| Safari on current/previous macOS, iOS, and iPadOS | Supported after real-device Add to Dock/Home Screen evidence passes                         | Installation instructions, standalone launch, safe areas, storage, update, and navigation behavior     |
| Firefox desktop/mobile                            | Browser-tab support only; installed mode untested                                           | Vireo does not promise an install prompt or standalone Firefox application                             |

The non-standard `beforeinstallprompt` event is an optional enhancement, never a
cross-browser requirement. The application must provide platform-appropriate manual
instructions where installation exists without a programmatic prompt.

## Required and optional web capabilities

The core browser-tab contract requires ES2022 modules, DOM, Fetch, URL,
AbortController, History, and secure-context behavior used by authenticated flows.
Features that persist application data must explicitly detect IndexedDB/storage
availability and surface an actionable degraded or unsupported state.

The PWA/offline contract additionally requires HTTPS or a local secure context,
Service Worker, Cache Storage, Web App Manifest processing, and IndexedDB. A browser
that renders the tab experience but denies these capabilities remains browser-tab
supported while the affected offline/install capability is unavailable.

Web Share, Badging, Notifications, Wake Lock, Background Sync,
`beforeinstallprompt`, OPFS, View Transitions, and similar platform enhancements are
optional. Every use requires feature detection, denial/revocation handling, and a
documented fallback. Vireo does not add legacy-browser polyfills to manufacture a
support claim.

## Continuous verification contract

| Cadence                                  | Mandatory evidence                                                                                                                                                                                                                    | Failure effect                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Every pull request                       | Canonical Node/npm and Java/Gradle builds; lint, format, types, unit/integration/contract/architecture checks; package and Maven consumer checks; H2 Template checks; Chromium desktop/mobile smoke                                   | Blocks merge                                                                                    |
| Nightly on `main`                        | Node floor and latest admitted patch; Java 21 plus Java 25 compatibility lane; PostgreSQL 17/18; Chromium, Firefox, and WebKit; package peer-floor consumers; clean container build                                                   | Opens/updates a tracked failure; blocks release until green or the row is publicly reclassified |
| Release candidate                        | Credential-free packed/published consumers, BOM alignment, Template published mode, migrations from every supported release line, PostgreSQL 17/18, branded Chrome/Edge, Firefox, macOS WebKit/Safari, OCI image and deployment smoke | Blocks release                                                                                  |
| Monthly clean room                       | Empty-cache Ubuntu 24.04/26.04, current macOS, and Windows 11/WSL2 setup; real Android and Apple-device browser/PWA flows; proxy, flaky network, low storage, locale/timezone/DST sampling                                            | Support row expires or is downgraded if evidence is not restored                                |
| Each admitted browser/OS/toolchain major | Install, build, upgrade, offline/update, accessibility, security, performance, and rollback impact review appropriate to the surface                                                                                                  | New major remains experimental or untested                                                      |

Every evidence record contains the repository commit, framework/Template versions,
exact dependency and browser versions, OS image and architecture, command/scenario,
cache state, date, result, and retained failure artifact. A green dependency-only
unit suite does not prove the Template, and a Playwright emulation does not prove a
physical device.

Required pull-request evidence must be green at merge. Nightly evidence remains
current for 48 hours, release-candidate evidence for that candidate, and manual
clean-room/device evidence for 35 days. A missed or stale cadence removes the right
to call that row supported until evidence is restored.

## Version admission, deprecation, and end of life

1. Upstream versions enter as untested. Stable releases may move to experimental
   after dependency review and a dedicated update branch passes basic verification.
2. Promotion to supported requires every applicable row in the continuous
   verification contract, updated manifests/docs, and a recorded support-cost
   review.
3. Supported patch releases are adopted promptly: security patches within seven
   days, or sooner when the upstream remediation window requires it; other patches
   within 30 days.
4. Node supports an admitted even-numbered LTS line. A new LTS receives up to 90
   days of soak before promotion; the outgoing Vireo line receives at least six
   months' notice before removal unless upstream EOL occurs sooner.
5. npm follows the current admitted major because upstream provides no LTS line.
   Major upgrades require lockfile/install-script review and clean consumers.
6. Java compilation floors change only between Vireo major releases. A newer LTS
   may first be admitted as a runtime without changing bytecode level.
7. Spring Boot, React, MUI, TypeScript, and Vite major changes require a Vireo major
   or an explicitly prerelease-only compatibility line. Minor-line removals receive
   at least six months' notice after public beta.
8. PostgreSQL majors remain supported while both upstream-supported and present in
   Vireo's two-major window. Consumers receive at least one Vireo minor release and
   six months' notice before a planned removal.
9. Rolling browsers leave support when they fall outside the published window.
   Feature removals caused by browsers still require release notes and remediation
   when feasible.
10. Deprecations name the replacement, first deprecated version, earliest removal
    version/date, migration path, and machine-detectable warning where practical.

No platform is silently dropped. The compatibility page and release notes are
updated before or with the change.

### Emergency drop

A platform may be removed without the normal notice only for an actively exploited
or critical vulnerability, upstream EOL/security abandonment, legal/licensing
constraint, unavailable build/runtime infrastructure, or a defect that makes a
truthful support claim impossible. Maintainers must publish:

1. the affected versions and capabilities;
2. severity and evidence without prematurely disclosing an embargoed vulnerability;
3. mitigation or safe replacement;
4. the last known-good Vireo release and its security limitations;
5. restoration criteria, if temporary; and
6. a follow-up migration or post-incident note.

## Scale-claim decision

None of the numeric user, concurrency, table-size, database-size, offline-working-set,
queue, or disconnected-duration targets in the
[product strategy](product-strategy.md) becomes a supported claim in Phase 0D.
They remain Phase 4 load, recovery, security, and field-validation hypotheses.

The 1–8 person team description is a positioning hypothesis for Phase 0E, not a
runtime guarantee. Until representative workload fixtures, percentile latency and
resource budgets, failure/recovery tests, and at least one external deployment exist,
Vireo may publish measurements with methodology but not capacity promises.

## Activation audit

As of 2026-08-27, this table preserves the broader activation audit. The narrower
machine matrix linked above is current and enforced.

| Concern              | Activated evidence                                                                                                                                     | Broader proof outside the current row                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Node/npm             | Both repositories pin Node 24.18.1/npm 12.0.2; seven npm `0.2.1` packages, fresh anonymous consumers, and the slim clean-container gate are current    | Continue patch updates and recurring records inside the admitted lines           |
| Java/Boot            | Java 21 and Boot 4.1.1 are canonical; signed Maven `0.2.0` artifacts, anonymous Central consumers, and both Java 25 recurring suites are current       | Broaden cross-repository BOM admission sampling                                  |
| React/MUI/TypeScript | React 19.2/MUI 9 ranges are bounded; TypeScript 6 plus required/optional peer-floor consumers are enforced and current                                 | Expand admitted-range sampling beyond floors                                     |
| PostgreSQL           | Starter's upgrade fixture, Template Flyway/browser CRUD on 17/18, and disposable logical backup/restore plus application-readiness rehearsal are green | Add witnessed recovery timing and incident rehearsal in a target environment     |
| Browsers             | Template checks desktop/mobile Chromium per merge; current recurring Playwright Firefox 153 and WebKit 26.5 full-stack smoke is green                  | Add branded browsers, macOS Safari, physical devices, and PWA flows under G-303  |
| Operating systems    | Required workflows pin Ubuntu 24.04 x64 and the digest-pinned slim Node container passes the complete TypeScript gate                                  | Ubuntu 26.04, macOS, Windows/WSL, and ARM64 remain explicit untested/manual rows |
| Deployment           | Template enforces digest-pinned images, Compose health/static/proxy/readiness smoke, graceful shutdown, request IDs, recovery and incident runbooks    | Add target-environment witness and multi-architecture proof                      |

The required rows admitted by the current machine matrix are active and close G-112.
Broader branded-browser, physical-device, installed-PWA, macOS, Windows/WSL, and
ARM64 evidence remains explicitly untested/manual and is tracked by G-303 or the
corresponding later-phase operations gap; it does not dilute the supported rows.

## Upstream evidence snapshot

This decision used current primary sources on 2026-08-26:

- [Node.js release schedule](https://github.com/nodejs/Release#release-schedule)
- [npm CLI support policy](https://github.com/npm/cli/wiki/Support-Policy) and [npm 12 changelog](https://github.com/npm/cli/blob/latest/CHANGELOG.md)
- [OpenJDK 21 release](https://openjdk.org/projects/jdk/21/) and [Java SE support roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html)
- [Spring Boot system requirements](https://docs.spring.io/spring-boot/system-requirements.html)
- [Gradle Java compatibility](https://docs.gradle.org/current/userguide/compatibility.html)
- [React versions](https://react.dev/versions) and [versioning policy](https://react.dev/community/versioning-policy)
- [Material UI supported versions](https://mui.com/material-ui/getting-started/support/) and [platforms](https://mui.com/material-ui/getting-started/supported-platforms/)
- [PostgreSQL versioning policy](https://www.postgresql.org/support/versioning/)
- [Playwright browser model](https://playwright.dev/docs/browsers)
- [web.dev PWA installation guidance](https://web.dev/learn/pwa/installation)
- [Ubuntu lifecycle](https://ubuntu.com/about/release-cycle) and [Windows 11 lifecycle](https://learn.microsoft.com/en-us/windows/release-health/windows11-release-information)

Upstream status changes over time. The generated public compatibility page must
record its review date and be refreshed at least monthly.
