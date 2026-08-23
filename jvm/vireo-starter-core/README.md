# Vireo Starter Core

Foundational Spring Boot contracts for reusable CRUD services, auditing, search,
stable API errors, optional-module integration, and library-owned Flyway
migrations.

Core owns the mechanics shared by the other Vireo JVM artifacts. Applications
still own their domain entities and DTOs, controllers, authorization policy,
business validation, database selection, and consumer-owned migrations.

## Installation

Gradle:

```groovy
dependencies {
    implementation platform("com.vireocode:vireo-starter-bom:0.2.0")
    implementation "com.vireocode:vireo-starter-core"
}
```

Maven:

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>com.vireocode</groupId>
      <artifactId>vireo-starter-bom</artifactId>
      <version>0.2.0</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>

<dependency>
  <groupId>com.vireocode</groupId>
  <artifactId>vireo-starter-core</artifactId>
</dependency>
```

Optional modules such as Auth, History, Query Engine, and Offline already bring
Core transitively. Declare Core directly when an application uses its base
service contracts without another JVM artifact.

## Primary workflow

A managed aggregate normally provides:

1. an entity extending `BaseEntity`;
2. a DTO and MapStruct `BaseMapper`;
3. a `SearchableRepository`;
4. a `BaseService` subclass with one immutable `EntityConfig`.

`BaseService` owns the CRUD transaction boundaries, soft-delete visibility,
keyword population, optional filter compilation, history recording, and offline
change publication. Customize the protected template hooks such as
`validateCreateRequest`, `applyRelations`, and `performDelete`; overriding the
public CRUD entry points is rejected because it can bypass those invariants.

History is opt-in per entity. If `EntityConfig.history` is present but no
`HistoryEventsRecorder` exists, the operation fails before persistence instead
of silently dropping an audit record. Query filters likewise fail explicitly
when no `FilterSpecificationBuilder` is installed.

## Auto-configuration

Adding the dependency provides replaceable defaults for:

- one UTC `Clock`;
- one stable `GlobalExceptionHandler`;
- Jackson 2 support for `JsonNullable`, Java time, and existing Vireo wire
  contracts;
- `JsonNullableMapper` and `JsonNodeMapper`;
- Spring Data JPA auditing and a security-context `AuditorAware<String>`;
- method security for Starter endpoints;
- a Flyway migration strategy when Flyway is present.

Ordinary consumer beans replace the `Clock`, `ObjectMapper`, error handler,
mappers, auditor, or Flyway strategy through `@ConditionalOnMissingBean`.
Applications that already enable JPA auditing retain their own auditing setup.

## Configuration

```properties
vireo.starter.core.expose-internal-error-details=false
vireo.starter.core.system-auditor=system
```

Internal exception details are hidden by default. Enable them only in a trusted
development environment. `system-auditor` is used when no authenticated,
non-anonymous principal is available and must not be blank.

## Web and security semantics

- `ApiError` is the stable error body for validation, malformed input,
  authentication, authorization, status exceptions, and unexpected failures.
- Duplicate validation errors for one field are retained in deterministic
  order rather than overwritten.
- Unexpected failures are logged server-side and do not expose exception class
  names or messages by default.
- `RestUtils.makePageable` rejects invalid public request values as HTTP 400;
  `rowsPerPage=-1` remains the explicit all-rows sentinel.
- `RestUtils.getCurrentPrincipal` excludes unauthenticated and anonymous
  security tokens.

Applications own their endpoint-specific authorization. Core only enables the
method-security infrastructure that the Starter modules' `@PreAuthorize`
contracts require.

## Persistence and migrations

Core does not own an application table. It coordinates migrations contributed
by optional modules through `StarterFlywayModule`:

- each module has a validated, SQL-safe name;
- migrations live under `classpath:db/vireo/{module}`;
- vendor additions live under `vendor/{database}`;
- each module owns `flyway_schema_history_vireo_{module}`;
- modules run deterministically by order and then name;
- duplicate module names abort startup.

The consumer's ordinary `flyway_schema_history` remains separate. Published
migrations are immutable; upgrades add a new version rather than editing an
applied script.

## Extension boundary

The `com.vireocode.starter.spi` package prevents Core from depending upward on
optional artifacts:

- Query Engine supplies `FilterSpecificationBuilder`.
- History supplies `HistoryEventsRecorder`.
- Offline supplies `OfflineRevisionTracker` and `OfflineChangeBroadcaster`.

Applications may implement those SPIs deliberately, but should not depend on
module implementation classes. Core is not a generic application framework:
domain workflows that do not fit its CRUD lifecycle should use ordinary Spring
services instead of forcing them through `BaseService`.

## Verification and documentation

Core is verified by module unit tests, dependency-only consumer context tests,
H2 and PostgreSQL migration/adoption/upgrade tests, Javadoc doclint, and the
committed public-API snapshot. The unified Vireo Starter Storybook displays
Java examples compiled by `vireo-starter-documentation-examples`; Javadocs are
the detailed type reference.
