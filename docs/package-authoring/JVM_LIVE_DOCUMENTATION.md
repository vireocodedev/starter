# JVM live documentation

Vireo Starter uses one documentation portal for the repository. The existing
Storybook remains the discoverable host, while Gradle and Javadoc remain the
authorities that prove Java source and API correctness.

## Principle

Java documentation must never imply that Storybook executes JVM code in the
browser.

- Storybook presents concepts, workflows, verified source, diagrams, and links.
- Gradle compiles every displayed Java example.
- JUnit and consumer-context tests execute behavior.
- Javadoc documents the detailed API.
- No Java source is duplicated as a manually maintained string in MDX or TSX.

The displayed source and the compiled source must be the same file.

## Navigation

The unified Vireo Starter Storybook has one top-level `JVM` section:

```text
JVM
  Overview
  BOM
  Core
  Auth
  Query Engine
  History
  Offline
```

Each artifact lives below `JVM` rather than becoming another root. This avoids
collisions with the TypeScript History and Query Engine libraries and makes the
five Spring Boot starters read as one aligned backend family.

Recommended navigation icons:

| Section      | Meaning                            |
| ------------ | ---------------------------------- |
| JVM          | Backend artifact family            |
| Core         | Foundation and extension contracts |
| Auth         | Authentication and security        |
| Query Engine | Search and filtering               |
| History      | Audit records                      |
| Offline      | Synchronization and hydration      |
| BOM          | Version alignment                  |

Icons aid recognition but do not replace explicit labels.

## Documentation layers

### Storybook guides

Storybook owns the approachable learning path:

- what an artifact is for;
- when to install it;
- its place in the module graph;
- its primary workflow;
- configuration and replacement seams;
- cross-stack relationships;
- selected failure and security semantics;
- links to detailed Javadoc.

Pages are documentation entries, not component stories. They do not expose
controls or claim browser interactivity for backend behavior.

### Compiled examples

Create one non-published Gradle module:

```text
jvm/vireo-starter-documentation-examples/
  build.gradle
  src/main/java/com/vireocode/starter/docs/
    core/
    auth/
    queryengine/
    history/
    offline/
```

The module depends on the real Starter projects and compiles representative
consumer code. It must not rely on test fixtures, internal packages, local
publication shortcuts, or application source.

Each example should be small enough to copy into a consumer and should focus on
one workflow. Prefer complete classes or configuration fragments over isolated
method bodies with undeclared context.

Storybook loads these `.java` files as raw text. If the documentation build must
copy or generate a manifest for Vite, the build must verify byte-for-byte source
identity. Hardcoded duplicate source strings are forbidden.

### Executable behavior

Source compilation proves type correctness, not runtime behavior. Use:

- module unit tests for algorithms and failure policy;
- Spring context tests for bean conditions;
- MockMvc tests for endpoints and security;
- migration tests for database behavior;
- `vireo-starter-autoconfigure-tests` for dependency-only consumer wiring and
  bean replacement;
- cold published-artifact tests for real Gradle consumption.

Documentation pages link to or name the relevant verification without embedding
test implementation as consumer guidance.

### Javadoc

Javadoc is the detailed API reference and ships with each artifact.

The root `aggregateJavadoc` task combines the public packages of all published
JVM libraries. Deploy its output beside Storybook when documentation hosting is
introduced:

```text
<docs-root>/                 unified Storybook
<docs-root>/javadoc/         aggregate JVM API reference
```

Storybook guides should link to the corresponding aggregate Javadoc package or
type. Javadoc should link back to the module README or guide when conceptual
context is required.

## Required artifact pages

Each JVM artifact contributes at least:

1. **Overview** — ownership, non-ownership, dependencies, and installation.
2. **Primary workflow** — one compiled, copy-pastable consumer example.
3. **Auto-configuration** — beans, conditions, ordering, and replacement behavior.
4. **Configuration** — properties, defaults, validation, and enablement.
5. **Extension points** — supported SPIs and customizers.
6. **Failure and security semantics** — behavior a consumer must understand.
7. **Persistence** — when the artifact owns tables or migrations.
8. **API reference** — direct Javadoc links.

Combine pages when the artifact is small. Do not split material only to create a
larger navigation tree.

## Page descriptions

Every page starts with two concise sections:

```md
<one sentence describing what the guide teaches>

## Why it exists

<the recurring consumer problem, the behavior Starter centralizes, and when the
consumer should use another mechanism>
```

For backend guides, also state the runtime boundary near the beginning:

- what auto-configures from the dependency;
- what the application must provide;
- what can be replaced.

## Source presentation

Displayed Java source must:

- import published coordinates and supported public packages;
- compile against the current source modules and later against packed artifacts;
- include all imports and declarations needed for its intended paste target;
- avoid repository aliases, test-only utilities, and undocumented internal APIs;
- use the BOM when showing dependency configuration;
- avoid placeholder ellipses inside source advertised as copy-pastable;
- remain formatted by the repository's Java formatter when one is adopted.

When a complete application class would obscure the subject, state exactly
which enclosing Spring configuration or application class receives the snippet.

## Output and interaction

Do not fabricate interactive Java output in Storybook.

When output materially helps understanding:

- derive static response fixtures from a tested resource;
- label them as example output;
- verify JSON fixtures against Java serialization and corresponding frontend
  schemas;
- link to the test that proves the runtime behavior.

Browser interaction belongs only to real frontend consumers of the backend
contract. A cross-stack guide may render an actual Vireo UI example backed by a
documented fixture, but must distinguish that frontend interaction from JVM
execution.

## Cross-stack guides

Query Engine, History, and Offline have matching TypeScript responsibilities.
Their JVM pages must link to the frontend package guide and describe the wire
boundary.

Cross-stack examples should answer:

- which side owns the schema;
- which JSON representation crosses the wire;
- how the frontend validates it;
- which behavior is backend-only or frontend-only;
- which changes require coordinated releases.

Shared JSON fixtures are preferable to separately maintained prose examples.

## Documentation contract tests

Add mechanical checks that:

- every published JVM artifact has a README;
- every artifact has the required Storybook overview entry;
- every displayed `.java` source belongs to the compiled documentation module;
- every compiled documentation source is either displayed or explicitly marked
  support-only;
- no MDX or TSX file contains a duplicated Java source literal;
- Javadoc and aggregate Javadoc complete with doclint;
- Storybook builds with all JVM pages;
- links from Storybook to generated Javadoc resolve in the deployment layout;
- cross-stack JSON fixtures pass Java serialization and frontend schema checks.

## Documentation build

The eventual repository documentation gate should run in this order:

1. Compile JVM production sources.
2. Compile the documentation-example module.
3. Run JVM tests and Javadoc/doclint.
4. Generate aggregate Javadoc.
5. Validate the JVM documentation manifest and source identity.
6. Build the unified Storybook.
7. Validate the assembled documentation output.

Storybook development may show Java source without rebuilding Gradle on every
browser refresh, but authoritative verification always compiles it first.

## Versioning

Documentation follows the artifact contract it describes.

- A new guide alone does not change the artifact version.
- A new public property, bean, endpoint, or extension point follows the JVM API
  versioning policy.
- Removing or changing documented behavior is not "docs only" when consumers
  depend on that behavior.
- Published documentation must correspond to one coherent Starter version; do
  not present main-branch Java APIs as though they belong to an older release.
