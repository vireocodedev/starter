# JVM observability contract

Vireo publishes identity- and payload-free Spring application events for the
operations it owns. When an application supplies a Micrometer
`ObservationRegistry`, conditional bridges also emit Micrometer observations.
No meter registry, tracing exporter, agent, or vendor backend is installed by
the libraries.

## Observation names and tags

| Observation                    | Low-cardinality tags              |
| ------------------------------ | --------------------------------- |
| `vireo.query.execution`        | `outcome`, `searched`, `filtered` |
| `vireo.query.relation.options` | `outcome`, `searched`             |
| `vireo.offline.batch`          | `operation`, `outcome`            |
| `vireo.offline.replay`         | `operation`, `outcome`            |
| `vireo.offline.queue`          | `operation`, `outcome`            |
| `vireo.offline.sse`            | `operation`, `outcome`            |
| `vireo.offline.lifecycle`      | `operation`                       |
| `vireo.history.lifecycle`      | `operation`                       |

Every tag value comes from a bounded enum or boolean. Entity names, relation
fields, URLs, search strings, command IDs, partition/owner/actor identifiers,
headers, request bodies, snapshots, and exception messages are never tags.
Counts and elapsed nanoseconds are fields on the structured events, not labels.

## Structured events

- `QueryExecutionObservationEvent` reports outcome, whether search/filtering was
  requested, result count, and elapsed time.
- `QueryRelationOptionObservationEvent` reports outcome, search presence, result
  count, and elapsed time.
- `OfflineObservationEvent` covers batch, replay, queue, and SSE operation and
  outcome families plus count and elapsed time.
- `OfflineDataLifecycleEvent` and `HistoryDataLifecycleEvent` report only bounded
  lifecycle operations and aggregate affected/held row counts.

Applications may consume these Spring events for structured logging or custom
metrics. Listeners must keep dimensions bounded and must not enrich telemetry
with application identities or payloads. Operational publishers catch listener
failures at query, relation-option, replay, queue, and SSE boundaries so an
unavailable telemetry sink does not change those operations. Lifecycle events
retain their existing transactional delivery semantics.

## Backend activation

Declare and configure the application's preferred Micrometer implementation and
publish an `ObservationRegistry` bean. The Vireo bridges then activate
automatically. Without that bean, event publication remains available and no
observability backend is required.
