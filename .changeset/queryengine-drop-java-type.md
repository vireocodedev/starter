---
"@vireocodedev/starter-queryengine": major
---

**Breaking:** `javaType` has been removed from the published entity contract.

`QueryEngineEntityDefinition.javaType` and `QueryEngineEntitySummary.javaType`
named a fully-qualified Java class. The package is otherwise scrupulously
generic — `QueryEngineEntityKey` is `string` so the engine works over any key set
— and this one field required every consumer, on any backend, to carry a JVM
concept forever.

The parse schemas built by `createQueryEngineEntitySchemas` now pass unknown keys
through instead of stripping them, so a backend that still sends `javaType` keeps
sending it and nothing is lost on the wire. Consumers that need it declare it
themselves:

```ts
type AppEntityDefinition = QueryEngineEntityDefinition & { javaType: string };
```

**Migration:** if you read `.javaType` off an entity definition or summary,
widen the type at the boundary where you fetch it. No runtime behaviour changes.

Closes gap G5 (roadmap 2.4, work item W5).
