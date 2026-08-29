# Vireo History

Append-only create, update, and delete history for entities managed through `BaseService`.

History owns snapshot serialization, neutral actor attribution, persistence, bounded chronological retrieval, and an optional policy-gated HTTP endpoint. Applications own entity kinds, actor identifiers, and record-level authorization.

## Supported API

- `HistoryRecord` and `HistoryActor`: immutable transport models shared with `@vireocodedev/history`.
- `HistoryActorResolver`: maps the application's current security context to an optional neutral actor.
- `HistoryReadAuthorizer`: application-owned per-entity read policy.
- `StarterHistoryProperties`: endpoint and result-limit configuration.
- `HistoryEventsRecorder`: the lower-level sink declared by `vireo-core`; replace it to store history elsewhere.

Persistence and the default controller/recorder are implementation details.

## Migration compatibility

The History 0.2 runtime still brings in Starter Auth solely so a fresh database can apply the immutable History V1 migration published in `jvm-v0.1.0`. History V2 copies the legacy owner values into the neutral actor columns and removes the Auth foreign key. Public Java code and the resulting schema are Auth-neutral; applications must use `HistoryActorResolver`, not `StarterUserDetails`, for attribution.

## Failure semantics

Recording participates in the owning service transaction. Missing identity, an empty event, snapshot serialization failure, or persistence failure aborts the operation. Malformed persisted snapshots fail retrieval explicitly. The module never converts those failures into partial records.

System activity has a `null` actor. The default resolver attributes authenticated activity by principal name and leaves the optional actor ID empty.

The read endpoint fails closed. The module does not install a permissive `HistoryReadAuthorizer`; even when `vireo.starter.history.endpoint-enabled=true`, no controller is published until the application supplies a bean named `historyReadAuthorizer`. That policy must decide access for the authenticated subject and the requested entity/entity ID, including owner, tenant, deletion, and field-redaction rules relevant to the application.

## Documentation

The unified Vireo Starter Storybook contains the live History guide. The source displayed there is compiled by `vireo-starter-documentation-examples`; Javadocs remain the complete API reference.
