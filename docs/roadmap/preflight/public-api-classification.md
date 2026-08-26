# Public API classification preflight

Classification date: 2026-08-26

Status: **entry-point and surface-growth policy enforced; breaking reductions scheduled by semver**

The repository now has one machine-readable classification at
`contracts/public-api-policy.json`. `corepack npm run api:policy` compares it with every
publishable workspace, npm export map, worker-safety snapshot, Maven module, and
JVM API snapshot. It runs inside the authoritative `npm test` chain.

This classification does not activate the public “supported” label. All listed
surfaces are release candidates until the D-105 evidence matrix is green. It does
make their ownership explicit and prevents a new export or artifact from silently
becoming public.

## Contract rules

### npm

- Only subpaths in a package's `exports` map are public entry points.
- Every exported subpath must be classified as `application`,
  `optional-integration`, or `authoring-tooling`.
- Every entry point declares its intended browser/worker environment. A worker
  claim must also pass the framework/DOM-free runtime-graph gate in
  `api-surface.json`.
- Every symbol reachable through a classified entry point is semver-accountable,
  regardless of its audience. “Authoring tooling” is not an internal escape hatch.
- Compiled files under `dist` that are not reachable through `exports` are package
  implementation details. Their presence in a tarball does not authorize deep
  imports.
- Wildcard exports are forbidden. The surface snapshots record symbols and runtime
  dependencies for every explicit entry point and require a reviewed snapshot plus
  changeset when they move.

The current 22 entry points classify as:

| Audience                | Count | Meaning                                                                                   |
| ----------------------- | ----: | ----------------------------------------------------------------------------------------- |
| Application             |    13 | Primary runtime API for application code                                                  |
| Optional integration    |     5 | Adapter API that requires the named third-party ecosystem                                 |
| Authoring/documentation |     4 | Storybook and documentation composition helpers; still a public versioned package surface |

### Maven

- Exactly five code modules plus the BOM are publishable and classified.
- The BOM is build tooling; the other modules are application/server APIs with a
  distinct product role.
- Java has no npm-style export map. Every public/protected type and member in the
  five code JARs is therefore part of the compatibility surface unless it is
  hidden before release.
- The committed `api-surface.txt` files are authoritative and publishing depends
  on their checks. Adding, removing, or changing a visible declaration requires an
  explicit snapshot/version decision.
- Test fixtures, documentation examples, and auto-configuration consumer projects
  have neither publication configuration nor API classifications and remain
  internal.

## Current classification

| Surface                                   | Role                        | Audience                |
| ----------------------------------------- | --------------------------- | ----------------------- |
| `starter-history`                         | History domain              | Application             |
| `starter-infrastructure`                  | Browser infrastructure      | Application             |
| `starter-localization`                    | Localization resources      | Application             |
| `starter-queryengine`                     | Query contracts             | Application             |
| `starter-shell`                           | Application-shell contracts | Application             |
| `starter-sqlite`                          | Offline persistence         | Application             |
| `starter-ui` root/country/event/forms     | React design system         | Application             |
| `starter-ui` third-party adapter subpaths | React design system         | Optional integration    |
| `starter-ui/storybook` subpaths           | React design system         | Authoring/documentation |
| `vireo-starter-core`                      | Server foundation           | Application             |
| `vireo-starter-auth`                      | Default authentication      | Application             |
| `vireo-starter-queryengine`               | Server query engine         | Application             |
| `vireo-starter-offline`                   | Offline-sync server         | Application             |
| `vireo-starter-history`                   | Server history              | Application             |
| `vireo-starter-bom`                       | Version alignment           | Build tooling           |

## Surface observations requiring follow-up

| ID      | Severity   | Finding                                                                                                                                                                           | Required disposition                                                                                                                                                            |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API-001 | Controlled | The UI package exposes 13 entry points and 1,364 distinct symbols; its root lists 757 exports and `./forms` lists 539. The published 7.1.0 line makes immediate removal breaking. | Growth is now capped per entry point. Curate and migrate the barrels through a reviewed major rather than deleting published symbols in place.                                  |
| API-002 | Decided    | Four Storybook/documentation entry points are public from the production UI package.                                                                                              | Retain them through 7.x; extract them into a dedicated authoring package with deprecation/migration guidance and a major release.                                               |
| API-003 | Controlled | The five JVM snapshots contain 111 public declarations across framework, configuration, persistence, HTTP, DTO, and SPI packages.                                                 | Every declaration now maps to an enforced package intent and module budget. Hide generated/internal types only through reviewed compatibility work.                             |
| API-004 | Minor      | TypeScript declarations are verified with the supported Vite/TypeScript `Bundler` resolution profile; NodeNext declaration resolution is not promised.                            | State the resolver requirement in public installation docs. Add NodeNext only after declaration imports are emitted with compatible extensions and a dedicated consumer passes. |

## Gate result

No publishable module or npm entry point is unclassified, no wildcard export exists,
and all worker claims agree with the runtime graph. UI growth budgets, the Storybook
next-major extraction decision, and package intent for all 111 JVM declarations are
enforced. The migration procedure lives in
[`PUBLIC_API_GOVERNANCE.md`](../package-authoring/PUBLIC_API_GOVERNANCE.md).
