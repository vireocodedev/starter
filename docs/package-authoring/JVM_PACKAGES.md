# JVM package authoring

This guide defines the required contract for published Vireo Starter JVM
artifacts. It applies to new modules immediately and to existing modules as they
are audited. The npm and JVM builds remain independent; sharing one repository
exists to keep cross-stack contracts reviewable, not to blur their toolchains.

## Boundary

A JVM module owns reusable Spring Boot mechanisms, contracts, persistence, or
default implementations. Consuming applications own their business entities,
roles, routes, authorization policy, deployment configuration, and product
workflows.

- Do not depend on a consuming application's Java package, entity enum, role
  enum, migration, endpoint vocabulary, or configuration class.
- Prefer open interfaces, registries, customizers, and conditional default beans
  over closed application-shaped enums or mandatory implementations.
- A default is replaceable only when a consumer can replace it with ordinary
  Spring beans without copying configuration or widening component scanning.
- Do not place reusable React or TypeScript behavior in JVM modules. Cross-stack
  wire contracts must remain explicit and independently verifiable.
- Importing an artifact must not start threads, create external connections, or
  mutate application state before Spring owns the corresponding bean lifecycle.

## Module responsibilities

Every published module must state what it owns and what it deliberately leaves
to consumers. One focused capability is preferable to a convenient dependency
bucket.

The current family is:

| Artifact        | Responsibility                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------- |
| `vireo-core`    | Shared base, web, configuration, migration, security-expression, and extension-point contracts |
| `vireo-auth`    | Replaceable default session authentication and user persistence                                |
| `vireo-query`   | Query metadata, filtering, relation options, and saved filters                                 |
| `vireo-history` | Append-only entity-change recording and retrieval                                              |
| `vireo-offline` | Offline replay, hydration, revision tracking, and SSE batching                                 |
| `vireo-bom`     | Compatible version alignment for the complete artifact family                                  |

The artifact description in Gradle, its README, package-level Javadoc, public
surface, and actual behavior must describe the same responsibility.

## Dependency policy

Treat every dependency declaration as part of the consumer contract.

- Use `api` only when a dependency's types necessarily appear in the public API
  or consumers must inherit it to use the module.
- Use `implementation` for implementation-only dependencies.
- Use `compileOnly` for genuinely optional integrations guarded by
  `@ConditionalOnClass` or an equivalent runtime boundary.
- Keep test libraries and consumer fixtures on test configurations.
- Do not add a module dependency merely to reuse one concrete class. Introduce a
  narrow SPI in the lowest correct module when the relationship is architectural.
- Keep the module graph acyclic and document every cross-module edge.
- The BOM aligns compatible versions; individual modules must not declare
  conflicting Starter versions.

An audit must distinguish a required capability dependency from coupling to one
default implementation. Persistence relations to another module's concrete JPA
entity are dependencies too, even when Java source imports appear convenient.

## Source structure

Organize packages by responsibility and visibility. Do not impose empty folders
for symmetry, but make consumer API, Spring wiring, persistence, and internal
implementation distinguishable.

```text
src/main/java/com/vireocode/starter/<module>/
  api/                consumer-facing models and services, when needed
  autoconfigure/      Spring Boot auto-configuration
  config/             configuration properties and validation
  persistence/        library-owned entities and repositories
  spi/                consumer extension points
  internal/           public-for-framework implementation, not consumer API
  package-info.java
```

Small modules may keep a flatter structure when each type's ownership remains
clear. Avoid generic `util`, `common`, and `model` buckets.

- Use package-private visibility for implementation whenever frameworks permit.
- When JPA, Spring Data, proxies, or reflection require a public type, place it
  under an explicit implementation package and document that it is not a
  consumer extension contract.
- Do not expose public setters, constructors, repositories, or controller
  implementation types merely to simplify tests.
- Add `package-info.java` for each consumer-facing package and describe its
  stability and intended use.

## Public API

The committed `api-surface.txt` file is the mechanical public-binary snapshot.
It detects drift; the audit decides whether the surface deserves to be public.

- Export consumer concepts, not framework wiring details.
- Prefer immutable request, response, event, and configuration models.
- Public collections must state ordering, mutability, uniqueness, and nullability.
- Public identifiers must state stability and permitted representations.
- Document thrown exceptions and fail-fast configuration behavior.
- Avoid returning persistence entities from controllers or service APIs.
- Do not make generated MapStruct implementations a consumer contract unless a
  consumer genuinely constructs them.
- Every accepted API change updates the surface snapshot and accompanies the
  appropriate JVM version decision.

The lack of Java Platform Module System exports does not turn every public class
into an endorsed consumer API. Documentation and package placement must clearly
separate supported API from framework-required public implementation, while the
surface gate continues to detect binary drift in both.

## Auto-configuration

A starter module must wire itself from the dependency alone.

- Register auto-configuration through
  `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`.
- Do not require the consumer to widen `@SpringBootApplication` component scanning.
- Use `@AutoConfiguration` ordering when one module requires another module's
  beans or migrations.
- Guard optional integrations with `@ConditionalOnClass`.
- Guard replaceable defaults with `@ConditionalOnMissingBean` using the
  consumer-facing contract type.
- Use `@ConditionalOnProperty` for explicitly optional capabilities.
- Prefer `proxyBeanMethods = false` configuration where proxying is unnecessary.
- Avoid bean creation whose observable work belongs in a lifecycle callback.
- Define deterministic behavior for missing, duplicate, and ambiguously ordered
  extension beans.

Consumer-style tests must prove both halves of the promise: the dependency alone
wires the defaults, and a consumer-provided bean makes only the corresponding
default withdraw.

## Configuration properties

Configurable behavior belongs in typed, validated `@ConfigurationProperties`.

```text
vireo.starter.core.*
vireo.starter.auth.*
vireo.starter.query-engine.*
vireo.starter.history.*
vireo.starter.offline.*
```

- Use stable, namespaced keys.
- Validate invalid combinations at startup with actionable messages.
- Document every default and whether changing it affects persistence, security,
  transport, or compatibility.
- Generate Spring configuration metadata so IDE completion matches the public
  property contract.
- Do not read environment variables or system properties outside Spring's
  configuration model.
- Never include secrets in `toString`, exception messages, diagnostics, or logs.

## Extension points and defaults

Every SPI must answer:

- who supplies it;
- whether zero, one, or many beans are supported;
- how multiple beans are ordered;
- what happens when none exists;
- what constitutes duplicate registration;
- whether failures abort startup, abort the operation, or are isolated;
- whether the default implementation withdraws completely when replaced.

Use narrow value-oriented contracts. Do not make consumers implement or depend
on a persistence entity merely to identify an actor, entity kind, or relation.

## Persistence and migrations

Library-owned tables require library-owned migrations and histories.

- Keep module migrations under `db/vireo/<module>`.
- Keep each module's Flyway history separate from the consumer's history.
- Declare migration order when foreign keys cross module boundaries.
- Treat applied migrations as immutable.
- Test a new database and an upgrade path on every supported vendor.
- Use bound parameters for runtime values and validate application-authored SQL
  identifiers before interpolation.
- State transaction, locking, idempotency, retry, and cleanup semantics.
- Reject corrupt persisted data explicitly; do not silently replace it with
  empty or partial data.
- Do not create a foreign key to a replaceable default module unless that
  coupling is an intentional, documented artifact contract.

Library persistence classes are implementation. Consumer APIs should use DTOs,
records, events, or service contracts rather than mutable JPA entities.

## HTTP and wire contracts

Controllers are cross-stack contracts.

- Validate path variables, query parameters, and request bodies at the boundary.
- Return transport models, never JPA entities.
- Define pagination, ordering, limits, missing values, and error semantics.
- Secure endpoints by default and provide an explicit application authorization seam.
- Keep OpenAPI annotations accurate and verify emitted JSON with MockMvc.
- Use ISO representations with documented timezone semantics.
- Keep Java request/response fixtures compatible with the corresponding frontend
  Zod schemas.
- Treat a one-sided frontend/backend wire-contract change as a defect.

## Transactions, concurrency, and lifecycle

- Put transaction ownership on the service operation that defines atomicity.
- Document whether auxiliary behavior such as history, offline revision updates,
  and event publication participates in the same transaction.
- Make retryable and idempotent operations explicit.
- Reject duplicate execution where replay would corrupt state.
- Clean thread-local, scheduler, listener, and stream state deterministically.
- Inject clocks, identifiers, schedulers, and external transports when doing so
  makes behavior deterministic and testable.
- Never swallow a failure that would make a claimed audit, persistence, or
  synchronization guarantee untrue.

## Security and diagnostics

- Default to authenticated or denied access rather than public access.
- Make domain authorization an application-owned extension point.
- Verify endpoint security through MockMvc.
- Avoid logging raw credentials, tokens, headers, request bodies, snapshots, or
  database payloads.
- Preserve useful exception causes without leaking sensitive data to HTTP clients.
- Separate safe client errors from internal diagnostics.
- Document development-only defaults and prevent them from silently reaching
  production.

## Failure semantics

Each module README and public workflow must explain how the module behaves when:

- configuration is invalid;
- an extension is absent or duplicated;
- serialization fails;
- persisted data is malformed;
- a database operation fails;
- authorization is denied;
- a downstream module or optional class is absent;
- an operation partially completes;
- the application replaces a default bean.

Silent success is not acceptable when the module's advertised responsibility
was not fulfilled.

## Testing contract

Each module must cover the layers relevant to its responsibility:

1. Focused unit tests for meaningful branches and failures.
2. Configuration-property validation tests.
3. Auto-configuration context tests.
4. Consumer workflow tests using only supported APIs.
5. Consumer override tests for replaceable defaults.
6. MockMvc tests for endpoints, validation, serialization, and security.
7. Persistence and migration tests on H2 and PostgreSQL where applicable.
8. Transaction, concurrency, retry, and idempotency tests where applicable.
9. Public API surface verification.
10. Published-artifact consumer smoke tests.

Tests may use internal implementation directly for focused coverage, but the
consumer test module must prove that ordinary dependency consumption works
without source-tree knowledge.

## Documentation contract

Every published artifact must provide a README containing:

- ownership and non-ownership;
- Gradle and Maven installation through the BOM;
- a copy-pastable primary workflow;
- auto-configuration behavior;
- configuration properties and defaults;
- public extension points;
- persistence and migration ownership;
- HTTP, security, and failure semantics;
- testing and versioning policy;
- links to compiled examples and Javadoc.

Package-level and public-type Javadoc must explain semantic contracts rather
than restating signatures. The Javadoc build runs with doclint and is part of
`check`.

JVM modules contribute discoverable guides to the unified Vireo Starter
Storybook according to [JVM live documentation](./JVM_LIVE_DOCUMENTATION.md).

## Publication and versioning

- Publish the ordinary JAR, sources JAR, and Javadoc JAR.
- Publish accurate POM dependency scopes and metadata.
- Align all JVM modules through `vireo-bom`.
- Never publish consumer tests or documentation-example modules.
- Before release, publish to a temporary repository and compile a clean external
  Gradle consumer against the BOM and every artifact.
- A public addition requires the corresponding compatible version decision; a
  removal, rename, raised dependency floor, wire incompatibility, property
  removal, or changed default with compatibility impact is breaking.
- Cross-stack contract changes must be versioned and verified on both sides in
  one pull request.

## Audit procedure

Audit one module at a time in this order:

1. Inventory source, resources, tests, dependencies, beans, migrations, and API surface.
2. State actual ownership and dependency direction.
3. Classify every public type and extension point.
4. Identify application coupling and hidden side effects.
5. Review persistence, wire, security, failure, and concurrency semantics.
6. Measure coverage against the testing contract.
7. Define documentation and compiled examples.
8. Produce an ordered remediation plan before changing implementation.
9. Implement focused items with one commit per coherent contract change.
10. Run module, consumer, publication, and repository verification.
