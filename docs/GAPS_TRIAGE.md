# Gap triage — decisions on LMS and FRED findings

Roadmap step 2.3. Inputs: [GAPS_LMS.md](GAPS_LMS.md) (G0–G17) and
[GAPS_FRED.md](GAPS_FRED.md) (F1–F18). Output: a decision for every one of the 36
gaps, and a scoped work-item list for 2.4.

## Decision vocabulary

| Decision         | Meaning                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| **Fix now**      | In the 2.4 set. Scoped into a work item below.                                                 |
| **Fix later**    | Real gap, in scope for the starter, but blocked on design or on a second consumer. Not in 2.4. |
| **Accept**       | A documented limitation. The starter will not do this, and the reason is written down.         |
| **Out of scope** | Not an admin-starter concern. The app is right to solve it itself.                             |
| **No action**    | Already fits; recorded for completeness.                                                       |

## How things were ranked

The roadmap's rule: _"Common themes across both prototypes rank highest — those
are structural, not incidental."_ Applied literally, the seven themes from
[GAPS_FRED.md](GAPS_FRED.md) sort like this:

| Theme                                   | Gaps                 | Decision                                   |
| --------------------------------------- | -------------------- | ------------------------------------------ |
| Contextual permission scope             | G11, F17             | **Fix now** — W1                           |
| Shell mode is the wrong axis            | G7, F3, G8           | **Fix now** — W2                           |
| Global event bus                        | G17, F10, part of G0 | **Fix now** — W4                           |
| Live data lives in signals, not queries | G3                   | Fix later                                  |
| Primitives get reinvented               | G0, F1               | Split — see below                          |
| Bespoke write path                      | G13, F9              | Divergent, not common → Fix later / Accept |
| Offline                                 | G16, F15, F16        | Divergent, not common → **Accept**         |

Two of those seven turned out to be _divergent_ rather than common: three apps
produced three unrelated answers for both the write path and offline. A theme
that three consumers disagree about is not a signal to build an abstraction — it
is a signal that the abstraction has no agreed shape yet. Both are demoted.

---

## The two explicit "no"s worth stating loudly

Per the step's own reasoning, saying no is as valuable as fixing.

### The starter is a routed, multi-page, table-first admin app. That is the bet.

**F4** (shell requires a router and five route config keys), **F5** (chrome is
floating panels, not nav slots) and **F8** (geometry editing is a live projection
of form state) are all **Out of scope**. They are not defects; they are FRED
being a different kind of application.

FRED is one page, has no routes at all, and edits a mutable OpenLayers object
graph. An admin starter that bent to accommodate that would stop being an admin
starter. The correct answer for a map app is a _map_ starter, or no starter.

What we should take from FRED is narrower and more useful: the parts it proved
_would_ have worked (`bare` mode, RHF + zod, the video player) and the parts that
were broken for everyone (F13, F6, F3).

### Offline is row-shaped by design, and will stay that way.

**G16** and **F16** are **Accept**. The starter bets on SQLite-WASM tables, a
row-shaped sync queue and negative temporary IDs. LMS chose IndexedDB with
hand-written grouping; FRED needs tile and raster caching and chose nothing.

Three apps, three answers, no overlap. Generalising over a sample where every
member disagrees produces an abstraction that fits none of them. The starter's
offline model is correct _for row-shaped admin data_ and should say so in
`ARCHITECTURE.md` rather than pretend to be general.

---

## Decisions — LMS gaps

| ID  | Gap                                                    | Severity | Decision              |
| --- | ------------------------------------------------------ | -------- | --------------------- |
| G0  | Starter dropped 4 primitives LMS depends on            | Blocker  | **Split** — see below |
| G5  | `javaType` leaks the backend into a published contract | Major    | **Fix now** — W5      |
| G7  | Shell varies by mode; LMS varies by role               | Major    | **Fix now** — W2      |
| G11 | No contextual/scoped permissions                       | Major    | **Fix now** — W1      |
| G14 | No reconnect strategy, no missed-event replay          | Major    | **Split** — see below |
| G15 | SSE handlers frozen at mount                           | Minor    | **Fix now** — W3      |
| G17 | Recurring need for an event bus                        | Minor    | **Fix now** — W4      |
| G1  | No entity registry; the two that exist barely overlap  | Major    | Fix later             |
| G2  | Registry ceremony does not scale to 50 entities        | Minor    | Fix later             |
| G3  | Live operational state has no home in the query model  | Major    | Fix later             |
| G4  | Filter DSL + builder stranded in the app               | Major    | Fix later             |
| G13 | SSE emitter is transport only                          | Major    | Fix later             |
| G9  | No per-role nav substitution                           | Minor    | Fix later             |
| G6  | LMS tables bypass the query engine                     | Minor    | Accept                |
| G8  | Primary surface is not a page                          | Major    | Accept                |
| G16 | Two incompatible offline implementations               | Major    | Accept                |
| G12 | No effective-role / impersonation                      | Minor    | Out of scope          |
| G10 | Flat role→permission granularity                       | Fits     | No action             |

### G0 splits four ways

The blocker is really four unrelated deletions, and they do not share a verdict:

| Dropped                  | Decision         | Reason                                                                                                                             |
| ------------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `tseep` event bus        | **Fix now** — W4 | Two of three apps needed one independently. Tiny, additive.                                                                        |
| `RgoWebWorkerService`    | Fix later        | Generic worker wrapper. Real, but the starter's only worker today is the SQLite one, which is already handled.                     |
| `RgoSnackbarProvider`    | Fix later        | Not a straight restore — the starter deliberately chose `sonner`, LMS and FRED both use notistack. Needs a decision, not a revert. |
| `RgoOfflineCacheService` | Accept           | It is the IndexedDB model. Covered by the offline "no" above.                                                                      |

So the only Blocker in either document reduces to one small work item plus two
deferred decisions. That is a better outcome than the raw severity suggested.

### G14 splits two ways

**Reconnect with backoff** is **Fix now** (W3) — bounded, no backend contract
needed, and every live-data consumer needs it.

**Missed-event replay** is **Out of scope** for now: it requires the server to
support `Last-Event-ID` and to retain an event window. That is a backend contract
decision the starter cannot make on a consumer's behalf.

### Why the big-ticket items are "Fix later", not "Fix now"

**G4** (promote the filter DSL and builder into `queryengine`) is the most
obviously in-scope idea in either document — filtering tables is the admin use
case. It is deferred anyway, because the evidence says the opposite of what
intuition says: **G6** found LMS bypasses the query engine entirely, and FRED has
no tables at all. Promoting a filter builder now would enshrine
leather-production's shape in a published package with still exactly one
consumer — which is precisely the single-consumer trap Phase 2 exists to break.
Gate it on a real second consumer.

**G1/G2/G13** (a unified entity registry, and making the SSE emitter
entity-aware) form one chain: G13 cannot be done well without G1, and G1 needs a
design pass that Phase 2 did not budget for. Deferring the chain intact is
cleaner than doing a third of it.

**G3** (live operational state has a home) is the one deferred theme that
appeared in both prototypes — 31 signal stores in LMS, 17 in FRED. Its first
deliverable is a _written convention_, not code, and that belongs next to the
template manifest in 3.1 rather than bolted onto 2.4.

### Accepts

- **G6** — the query engine is opt-in. An app with hand-built tables is
  supported, not broken.
- **G8** — largely answered by F2: `bare` mode does host a non-page primary
  surface, and W2 makes it reachable per route.
- **G12** — impersonation and effective-role switching are an LMS supervisor
  feature. Out of scope for a starter.

---

## Decisions — FRED gaps

| ID  | Gap                                                       | Severity | Decision                                       |
| --- | --------------------------------------------------------- | -------- | ---------------------------------------------- |
| F3  | `shell.mode` is global per app, not per route             | Major    | **Fix now** — W2                               |
| F17 | Role-only checks plus tenant scope; no permissions        | Major    | **Fix now** — W1                               |
| F13 | `RgoVideoStreamPlayer` hardcodes English copy             | Major    | **Fix now** — W6                               |
| F6  | `mobileBottomNavigation` required even when bare          | Minor    | **Fix now** — W7                               |
| F10 | Imperative map object graph + global event bus            | Major    | **Split** — bus → W4, map graph → out of scope |
| F14 | Unbounded concurrent video streams                        | Minor    | Fix later                                      |
| F1  | 40 primitives reinvented; consumes no shared library      | Major    | Accept                                         |
| F9  | Zero `useMutation`; write path is bespoke                 | Major    | Accept                                         |
| F16 | Row-shaped offline model inapplicable to spatial data     | Major    | Accept                                         |
| F18 | Provider composition rebuilt per app                      | Minor    | Accept                                         |
| F4  | Shell requires a router and 5 route config keys           | Major    | Out of scope                                   |
| F5  | Chrome is floating panels, not nav slots                  | Major    | Out of scope                                   |
| F8  | Geometry editing is a live projection, not a submit cycle | Major    | Out of scope                                   |
| F11 | StrictMode worked around via `useEffectNoStrict`          | Minor    | Out of scope                                   |
| F2  | `bare` shell mode hosts a full-bleed map                  | Fits     | No action                                      |
| F7  | react-hook-form + zod + create/update group               | Fits     | No action                                      |
| F12 | Starter's video player beats FRED's                       | Fits     | No action                                      |
| F15 | No offline expectations to violate                        | Fits     | No action                                      |

### Accepts

- **F1** is not a gap, it is an **outcome measure**. "Did a team reinvent 40
  primitives" is the metric the whole starter is judged by; it has no direct fix.
  Re-check it after 2.4 and again after Phase 3.
- **F9** — the starter's mutation conventions are opt-in. An app that calls its
  REST layer directly loses those conventions and nothing else.
- **F18** — `Providers list={PROVIDERS}` is five lines of `reduceRight`. It
  appeared in two apps because it is obvious, not because it is hard. Publishing
  a five-line helper adds an API surface, a version, and a migration cost to save
  nobody any thinking. Deliberately not doing this.

### Out of scope

**F11** (`useEffectNoStrict`) is an OpenLayers idempotency problem. Handing
consumers a hook that opts out of StrictMode's correctness check would be
actively harmful advice.

---

## The fix-now set — work items for 2.4

Seven items. Each ships with a changeset.

### W1 — Scoped permissions

**Closes G11, F17.** The top-ranked structural theme: both second-domain apps
need a second dimension on the permission check and neither can express it. LMS
scopes by active shift, FRED by `companyId` tenant.

- Widen the permission check so a consumer can supply a scope alongside the
  permission, and thread it through `RgoShowIf`, the nav visibility filter and
  the route guards.
- Keep the unscoped call signature working unchanged — leather-production uses
  it and must not churn.
- Packages: `starter-shell`, `starter-ui`. **Minor** bump (additive).

### W2 — Shell mode selectable per route

**Closes G7, F3; resolves G8.** `shell.mode` is one global value on `AppConfig`,
so an app is entirely dashboard or entirely bare. LMS needs it to vary by role,
FRED by route.

- Allow a route group to override the app-level mode; keep `shell.mode` as the
  default.
- Verify `AppBareShellLayout` still composes correctly when it is not the app
  default.
- Package: `starter-shell`. **Minor** bump (additive, default preserved).

### W3 — SSE reconnect and live handlers

**Closes G15 and the reconnect half of G14.** `useRgoSseEmitter` freezes its
handler map at mount behind four `react-hooks/exhaustive-deps` suppressions, and
has no automatic reconnect — FRED's provider simply closes the stream on error.

- Replace the frozen `useMemo(..., [])` with a ref that tracks the latest
  handlers, and delete the four suppressions.
- Add automatic reconnect with backoff and a `maxRetries` escape hatch; keep the
  manual `reconnect()` callback.
- Explicitly **not** doing missed-event replay.
- Package: `starter-ui`. **Minor** bump. The suppression removal is a genuine bug
  fix and should be called out in the changeset.

### W4 — Publish an event bus

**Closes G17, the bus half of F10, and the `tseep` part of G0.** `front-ui`
bundled one; the starter dropped it; two of three apps rebuilt it.

- Re-expose a small typed emitter, with an augmentable event-map interface so
  consumers declare their own events — the same pattern `RgoDroppableIdRegistry`
  already uses successfully.
- Package: `starter-ui` (or its own entry point if it pulls a dependency).
  **Minor** bump.

### W5 — Remove `javaType` from the published contract

**Closes G5.** `QueryEngineEntityDefinition.javaType` puts a backend
implementation detail into a published type.

- Remove the field from the published model.
- This is **breaking** → **major** bump on `starter-queryengine` (1.1.2 → 2.0.0).
  There is exactly one consumer today, so the cost is at its historic minimum and
  only grows.

### W6 — Localise `RgoVideoStreamPlayer`

**Closes F13.** Three hardcoded English strings — "Error Loading Stream",
"Unable to connect to the video stream. Please check the URL and try again.",
"Retry" — in a component published from a monorepo that ships
`starter-localization`.

- Route them through the platform translation function like sibling components,
  and add the keys to `starter-localization`.
- Packages: `starter-ui`, `starter-localization`. **Minor** bump.
- The cheapest item here and a real defect for every consumer, not just FRED.

### W7 — `mobileBottomNavigation` optional outside dashboard mode

**Closes F6.** A bare full-bleed app must currently still declare
`authenticatedItems`, `loginItem` and `moreItem`.

- Make the key optional when the resolved mode is not `dashboard`; adjust
  `app.config.validation.ts` to match.
- Package: `starter-shell`. **Minor** bump.

### Sequencing note

W2 and W7 both touch `AppConfig` and its validation, so do them together. W1
depends on nothing. W5 is the only breaking change and should land in its own
release so the consumer bump is unambiguous.

---

## Tally

| Decision                        | Count                 |
| ------------------------------- | --------------------- |
| Fix now                         | 9 gaps → 7 work items |
| Fix later                       | 7                     |
| Accept as documented limitation | 7                     |
| Out of scope                    | 5                     |
| No action (already fits)        | 5                     |
| Split across decisions          | 3 (G0, G14, F10)      |
| **Total**                       | **36**                |

The one Blocker reduced to a single small work item. Of the ten FRED Majors, four
are out of scope by design and three are accepted — which is the intended result
of running a probe against an app the starter was never meant to serve.

## Exit criteria for 2.4

From the roadmap: _"The fix-now set is implemented and released; a re-run of the
paper prototype hits no blockers."_

Concretely, after 2.4:

- W1–W7 implemented, each with a changeset, and published.
- Re-walk both gap documents. G0 must no longer read as a Blocker.
- leather-production upgraded to the new versions with no regressions in its
  existing validation baseline — including the `starter-queryengine` major from
  W5.
