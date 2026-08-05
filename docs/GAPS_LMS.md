# Gap list — lock management system (LMS) against the starter

Roadmap step 2.1. This is the first of two second-domain probes; the drone-map
(FRED) probe is 2.2, and triage of both is 2.3.

Unlike the roadmap's original framing, this was not done from memory — the LMS
source (`lms-front`, `lms-back`, `front-ui`) was read directly. Every claim below
cites a file.

**Severity legend**

|             | Meaning                                                            |
| ----------- | ------------------------------------------------------------------ |
| **Blocker** | LMS could not be built on the starter without changing the starter |
| **Major**   | Possible, but you would fight the abstraction the whole way        |
| **Minor**   | Local workaround is acceptable                                     |
| **Fits**    | The starter already handles this                                   |

---

## Correction to the premise before anything else

Phase 2's stated goal is "break the single-consumer trap — every abstraction today
is shaped by leather-production, because it is both the customer and the spec."

**That is only half true, and the half that is false matters.**

`starter-ui` is a descendant of `@rgo/front-ui`, the library LMS consumes today.
The lineage is visible in the source: the drag-and-drop registry in
[packages/ui/src/features/@hello-pangea/dnd/models/RgoDroppableId.ts](../packages/ui/src/features/@hello-pangea/dnd/models/RgoDroppableId.ts)
documents its augmentation pattern using `chamber` and `stream` as the worked
example — those are _lock_ concepts, not leather ones. `RgoVideoStreamPlayer` and
its `ovenplayer` dependency exist for drone video, which is why leather-production
has never had a consumer for it.

So the starter is not purely leather-shaped. It is **front-ui with the operational
parts removed and admin-app parts added**. That reframes 2.1's real question from
"would the starter fit LMS?" to "what did the starter lose on the way?", which is
a sharper question with a more uncomfortable answer.

### G0 — the starter dropped four primitives LMS depends on — **Blocker**

Present in `front-ui`, absent from every starter package:

| Primitive                | front-ui files | starter |
| ------------------------ | -------------- | ------- |
| `RgoOfflineCacheService` | 4              | 0       |
| `RgoWebWorkerService`    | 6              | 0       |
| `RgoSnackbarProvider`    | 8              | 0       |
| `tseep` (event bus)      | 6              | 0       |

Moving LMS onto the starter today is a **regression**, not a migration. This is
the single most important finding in this document, and it was invisible from
inside leather-production.

---

## Probe 1 — "Model chambers, vessels and operators as management entities. Does the entity registry shape fit?"

### G1 — there is no entity registry in the starter to fit — **Major**

Both apps needed one and both invented their own, independently:

- LMS: `lms-front/src/setup/entity.ts` (`LmsEntity`, 50+ keys derived from backend
  `@Table` annotations), `src/setup/entitytozodschema.ts` (entity → zod schema),
  `src/setup/querykey.ts` (entity → query keys, 185 lines).
- leather-production: `src/app/management/managementEntities.ts`
  (`MANAGEMENT_ENTITIES`).

The recurrence across two domains is exactly the evidence Phase 2 exists to
produce. But note **what each registry is for**, because they barely overlap:

|                                          | LMS registry              | leather-production registry |
| ---------------------------------------- | ------------------------- | --------------------------- |
| Entity key union                         | yes                       | yes                         |
| Entity → zod schema                      | yes (parses SSE payloads) | no                          |
| Entity → query keys                      | yes (invalidation)        | no                          |
| Entity → IndexedDB store                 | yes                       | no                          |
| Entity → i18n title / search placeholder | no                        | yes                         |
| Entity → create permission               | no                        | yes                         |

leather-production's registry describes **page chrome**. LMS's describes **cache
identity**. Extracting today's `MANAGEMENT_ENTITIES` into the starter would ship
the wrong abstraction — it is the smaller and more incidental of the two.

### G2 — scale mismatch — **Minor**

LMS registers 50+ entities spanning the whole backend schema; leather-production
registers a handful of management pages. Any registry that requires per-entity
i18n keys and a create permission (as `MANAGEMENT_ENTITIES` does) becomes 50
lines of ceremony for entities that never get a page.

---

## Probe 2 — "Express 'vessels currently in chamber 3' in the query-engine contract. Can it?"

### G3 — no. And LMS never asks — **Major** (but see triage note)

The query engine contract
([packages/queryengine/src/models/queryengine.models.ts](../packages/queryengine/src/models/queryengine.models.ts))
describes _filterable fields_ — path, type, operators, nested `children` with
`maxDepth`. Relation traversal is expressible in principle.

What is missing for this specific query:

1. **No boolean composition.** Operators are per-field; there is no AND/OR
   grouping anywhere in the contract.
2. **No temporal predicate.** "Currently" means the chamber's lockage is
   `ONGOING` — a status-dependent join, not a field comparison.
3. **The traversal is four hops**: Chamber → Lockage (status ONGOING) → convoys →
   ConvoyVessel → Vessel.

LMS's actual answer is architecturally different: it holds the entire live working
set in memory as signals (`sigLockages`, `sigConvoys`, `sigChambers`) and derives
the answer client-side. See `LmsPageTraffic.tsx`, which reads
`sigLockagesRecord.value[chamberLockageId]` directly.

The query engine is for **reporting and management tables**. Live operational
state is a different problem the starter does not address at all.

### G4 — the filter DSL is not in the contract — **Major**

`packages/queryengine/src/components/` is **empty**, and the package exports only
api / query / models / querykeys / signals. The actual filter payload shape
(`filtersJson`, rows, groups) and the 802-line filter-builder UI
(`SavedFilterJsonFiltersForm.tsx`) live in **leather-production**.

The engine publishes the _description_ of what is filterable but not the
_language_ to express a filter. The most domain-agnostic, most reusable piece of
the whole feature is stranded in the app.

### G5 — `javaType` is a required field in a published contract — **Major**

```ts
export interface QueryEngineEntityDefinition {
  key: QueryEngineEntityKey;
  title: string;
  javaType: string; // <- backend implementation, in the wire contract
  fields: QueryEngineFieldDefinition[];
}
```

Every consumer must carry a field named `javaType`, forever, including consumers
whose backend is not Java. `QueryEngineEntityKey` was deliberately kept opaque
(`= string`) for genericity three lines above; `javaType` undoes that discipline.

### G6 — LMS's own tables bypass the engine anyway — **Minor**

`features/vessel/api/` uses a hand-written `LmsVesselFilters` with a bespoke
online/offline pair, not the generic engine. The online/offline split _pattern_
matches leather-production, but the filter vocabulary does not.

---

## Probe 3 — "Place a live-status panel in the three shell modes. Where does it mount?"

### G7 — the mode axis is the wrong axis — **Major**

The starter offers `AppShellMode = "dashboard" | "public" | "bare"`
([packages/shell/src/config/app.config.types.ts:161](../packages/shell/src/config/app.config.types.ts)).

LMS varies its chrome by **role**, not by mode:
`LmsOperatorLayoutNav`, `LmsSupervisorLayoutNav`, `LmsAdminLayoutNav`, sharing
`LmsLayoutNavShell`. All three are "dashboard" in the starter's vocabulary. The
distinction the starter offers is not the distinction LMS needs, and the one LMS
needs is not expressible.

### G8 — the primary surface is not a page — **Major**

`LmsPageTraffic.tsx` is a five-region CSS grid — two `ChamberPreview` columns
flanking a stacked `ConvoyStream` / `RadioCallStatusBar` column — inside a bare
`RgoPage`. There is no slot to mount a live-status panel _into_; **the page is the
panel**. It is full-bleed, non-scrolling, and drag-and-drop driven.

The starter's page model assumes a toolbar, a table and overlays. Nothing here is
hostile to that model exactly — it simply does not use any of it.

### G9 — role-driven nav has no starter equivalent — **Minor**

`useVisibleNavEntries` filters by permission, which covers _hiding_ entries. It
does not cover _substituting an entire nav rail per role_, which is what LMS does.

---

## Probe 4 — "Operator may move a vessel but may not open a gate. Does the RBAC model express that granularity?"

### G10 — flat role→permission granularity: **Fits**

LMS's model is a static map (`lms-front/src/setup/permissions/lmsPermissions.ts`):

```ts
export const LMS_PERMISSIONS = {
  "page:traffic": [ROLE_OPERATOR],
  "vessel:viewHistory": [ROLE_OPERATOR],
  "lock:selectAny": [ROLE_SUPERVISOR, ROLE_ADMIN],
} as const satisfies Record<string, readonly LmsUserRole[]>;
```

with `lmsCan` / `useLmsCan` / `lmsCanFromSignal`. The stated example is two
permission keys. The starter's generic `TPermission` handles this directly. This
probe's literal question is a **non-issue**.

### G11 — _contextual_ permission is the real gap — **Major**

The question the roadmap should have asked. Neither app's authorisation is purely
role→permission:

- **LMS** scopes by shift: backend
  `UserIsOperatorWithActiveShiftOrSupervisorOrAdmin.java`, frontend
  `LmsRouteGuardStartShift.tsx`. "Operator may move a vessel" is really "operator
  **with an active shift** may move a vessel."
- **FRED** scopes by tenant:
  `<FredProtect role="ROLE_POWER_USER" companyId={companyId}>`, enforced server
  side by `CompanyIdValidator.java`.

The starter's permission check takes a permission and nothing else — there is no
scope or subject parameter. **Two independent domains both needed a second
dimension.** By 2.3's own rule ("common themes across both prototypes rank
highest — those are structural"), this is the strongest structural candidate in
this document.

### G12 — no effective-role / impersonation concept — **Minor**

LMS carries `sigUserEffectiveRole` and `sigForceSupervisorView` — a supervisor can
view as another role, and permission checks must read the _effective_ role. The
starter reads the authenticated role only.

---

## Probe 5 — "LMS is event-driven. How far does the SSE emitter get you?"

### G13 — `useRgoSseEmitter` is transport only — **Major**

[packages/ui/src/hooks/useRgoSseEmitter/useRgoSseEmitter.ts](../packages/ui/src/hooks/useRgoSseEmitter/useRgoSseEmitter.ts)
opens an `EventSource`, attaches a `Record<eventName, handler>`, and exposes a
manual `reconnect()`. That is roughly 20% of what an event-driven app needs.

What LMS built on top, none of which is in the starter:

- A **generic entity envelope** — `create` / `update` / `delete` / `batch` events
  carrying `{ target, payload }`, where `target` is an entity key.
- **Schema-validated payloads** via `ENTITY_TO_ZOD_SCHEMA[target].parse(...)`.
- **Automatic cache invalidation** — `invalidateQueriesForEntity(target)` walking
  `LmsQueryKey[entity]` (`src/setup/queryclient.ts`).
- **Local persistence** — `IDBService.db.put(target, payload)`.
- **Heartbeat-driven online/offline**, with `initQueryClientEffects` evicting
  active queries whose `meta.supportsOffline === false` on transition.

The reusable abstraction here is _"server entity event → local cache
invalidation"_. It is domain-agnostic, it is the hard part, and it is absent.

### G14 — no reconnect strategy — **Major**

The starter's `reconnect()` must be called by someone. FRED's provider does not
call it — `onerror` just closes the stream, so the app silently stops receiving
events. Neither the starter nor either consumer implements backoff, and nothing
implements **replay/catch-up of events missed while disconnected**. For an
operational system this is a correctness issue, not a polish issue.

### G15 — handlers are frozen at mount — **Minor, but a real footgun**

```ts
// eslint-disable-next-line react-hooks/exhaustive-deps
const eventHandlersMemo = React.useMemo(() => eventHandlers, []);
```

Four such suppressions in a row. A handler closing over state captures it once and
never updates. Both apps happen to dodge this by writing to module-level signals
rather than React state — which works, but by luck of convention rather than by
design.

---

## Cross-cutting

### G16 — two incompatible offline implementations — **Major**

|                | LMS                                   | leather-production / starter      |
| -------------- | ------------------------------------- | --------------------------------- |
| Store          | IndexedDB (`IDBClient`, `IDBService`) | SQLite-WASM                       |
| Query          | JS filtering over `store.getAll()`    | SQL via `bindSqliteSearchColumns` |
| Pending writes | sync queue, negative temp IDs         | offline sync adapter              |
| Conflicts      | most-negative-id-shadows-latest       | —                                 |

`vessel.offline.ts` reimplements paging, sorting, searching and
offline-shadowing by hand in TypeScript. Same problem, same online/offline API
split, entirely different machinery. Neither is obviously right, which is
precisely why one consumer was not enough to design this.

### G17 — a global event bus keeps reappearing — **Minor**

front-ui bundles `tseep`; FRED uses it for `olEventService.emit("geometry:change")`.
The starter has no event bus. Two of three apps wanted one.

---

## Summary

| ID  | Gap                                                    | Severity    |
| --- | ------------------------------------------------------ | ----------- |
| G0  | Starter dropped 4 primitives LMS depends on            | **Blocker** |
| G1  | No entity registry; the two that exist barely overlap  | Major       |
| G3  | Live operational state has no home in the query model  | Major       |
| G4  | Filter DSL + builder stranded in the app               | Major       |
| G5  | `javaType` leaks the backend into a published contract | Major       |
| G7  | Shell varies by mode; LMS varies by role               | Major       |
| G8  | Primary surface is not a page                          | Major       |
| G11 | No contextual/scoped permissions (shift, tenant)       | Major       |
| G13 | SSE emitter is transport only                          | Major       |
| G14 | No reconnect strategy, no missed-event replay          | Major       |
| G16 | Two incompatible offline implementations               | Major       |
| G2  | Registry ceremony does not scale to 50 entities        | Minor       |
| G6  | LMS tables bypass the query engine                     | Minor       |
| G9  | No per-role nav substitution                           | Minor       |
| G12 | No effective-role / impersonation                      | Minor       |
| G15 | SSE handlers frozen at mount                           | Minor       |
| G17 | Recurring need for an event bus                        | Minor       |
| G10 | Flat role→permission granularity                       | **Fits**    |

**One blocker, ten majors, six minors, one clean fit.**

The two findings most likely to survive triage are **G11** (contextual
permissions — independently required by both LMS and FRED) and **G0** (the
starter is behind its own ancestor). G13/G14 rank next, since an event-driven
consumer is the case the starter claims to support and does not.

Cross-reference with the FRED gap list in 2.2 before triaging in 2.3: see
[GAPS_FRED.md](GAPS_FRED.md), whose closing section tabulates the themes common
to both prototypes.
