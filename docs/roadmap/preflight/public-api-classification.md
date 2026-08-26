# Public API classification preflight

Classification date: 2026-08-26

Status: **entry-point policy enforced; surface-reduction decisions remain**

The repository now has one machine-readable classification at
`contracts/public-api-policy.json`. `npm run api:policy` compares it with every
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

| ID      | Severity | Finding                                                                                                                                                                                                                             | Required disposition                                                                                                                                                                                                  |
| ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API-001 | Major    | The UI package exposes 13 entry points and 1,364 distinct symbols; its root alone lists 757 exports and `./forms` lists 539. That is a very large compatibility and documentation obligation.                                       | Before public 1.0, identify genuine consumer tasks, remove accidental barrels, prefer cohesive component/type exports, and publish a reviewed major if an already-released private surface is intentionally narrowed. |
| API-002 | Major    | Four Storybook/documentation entry points are public from the production UI package. They are now honestly classified and semver-protected, but they expand production package size and couple authoring fixtures to UI releases.   | Decide whether they remain a supported authoring API, move to a dedicated package, or become repository-only fixtures before the final public coordinates are created.                                                |
| API-003 | Major    | The five JVM snapshots contain 111 public top-level types. Spring configuration, controllers, persistence entities/repositories, DTOs, SPI seams, and intended extension points currently share the same binary-compatibility tier. | Classify type/package intent in Javadoc, introduce internal package boundaries where safe, and run a compatibility review before the first public release freezes expectations.                                       |
| API-004 | Minor    | TypeScript declarations are verified with the supported Vite/TypeScript `Bundler` resolution profile; NodeNext declaration resolution is not promised.                                                                              | State the resolver requirement in public installation docs. Add NodeNext only after declaration imports are emitted with compatible extensions and a dedicated consumer passes.                                       |

## Gate result

No publishable module or npm entry point is unclassified, no wildcard export exists,
and all worker claims agree with the runtime graph. The policy is ready to guard
ongoing work. The large UI/JVM surfaces and Storybook placement remain explicit
public-release design decisions rather than hidden enforcement gaps.
