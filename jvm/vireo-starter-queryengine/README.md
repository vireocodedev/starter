# Vireo Starter Query Engine

`vireo-starter-queryengine` turns application-authored entity metadata into a validated filtering contract for Spring Data JPA and provides authenticated, per-user saved filters.

## Why it exists

Data-heavy applications otherwise duplicate filter metadata, request parsing, Criteria predicates, relation-option lookup, and saved-filter persistence for every aggregate. Query Engine centralizes those mechanics while applications retain ownership of entity keys, filterable fields, relation labels, authorization policy around domain data, and the frontend experience.

## Installation

```groovy
dependencies {
    implementation platform("com.vireocode:vireo-starter-bom:0.2.0")
    implementation "com.vireocode:vireo-starter-queryengine"
}
```

The artifact depends on Core and on Auth's default user model because saved filters currently reference `StarterUser`. It auto-configures the registry, metadata generator, Core filter SPI implementation, relation-option service, authenticated controllers, and the module-owned saved-filter migration.

## Application contract

1. Define an application enum implementing `QueryEntityKey`.
2. Publish one or more `QueryEntityTypeResolver` beans.
3. Annotate only explicitly filterable entity fields with `@Filterable`.
4. Add `@FilterableMetadata` when an entity needs a title or default relation label fields.
5. Send a `QueryFilterRequest` whose entity key matches the service domain.

Entity keys are normalized to upper case and must be unique. Entity types must be registered; Query Engine never invents a fallback key. Custom metadata providers and predicate resolvers are Spring beans, so dependency injection and replacement remain explicit.

## Safety and ownership

- Only paths and operators published in generated metadata are accepted by the auto-configured filter builder.
- Invalid typed values fail with HTTP 400 rather than silently disappearing.
- Relation-option searches inspect declared relation label fields and have a bounded result count.
- Saved-filter reads return the current user's filters plus public filters.
- Only the owner may update or delete a saved filter; request JSON cannot assign `userId` or `username`.
- All default endpoints require an authenticated caller.

`isPublic` means discoverable by other authenticated users, not editable by them. Domain record authorization remains an application responsibility and should be enforced before applying a filter to protected data.

## Configuration

```properties
vireo.starter.query-engine.endpoint-enabled=true
vireo.starter.query-engine.saved-filters-endpoint-enabled=true
vireo.starter.query-engine.endpoint-path=/api/queryengine
vireo.starter.query-engine.saved-filters-endpoint-path=/api/filters
vireo.starter.query-engine.relation-options-limit=20
```

Both endpoint paths must be absolute and distinct. The relation-option limit accepts values from 1 through 1000. Disabling controllers does not disable the registry, metadata generator, filter builder, services, or migrations.

## HTTP surface

- `GET {endpoint-path}/entities`
- `GET {endpoint-path}/entities/config`
- `GET {endpoint-path}/entities/{entityKey}`
- `GET {endpoint-path}/entities/{entityKey}/fields/{fieldPath}/options`
- saved-filter list, search, default, create, update, and delete operations under `{saved-filters-endpoint-path}`

The matching TypeScript package is `@vireocodedev/starter-queryengine`. The JVM module owns metadata generation, persistence predicates, relation lookups, and saved-filter authorization; the TypeScript package owns browser-side schemas, query construction, and local execution support.

See the unified Vireo Starter Storybook under **JVM → Query Engine** for the compiled registration example and operational guidance.
