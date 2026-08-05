# Gap list — drone-map app (FRED) against the starter

Roadmap step 2.2. Second of two second-domain probes; see
[GAPS_LMS.md](GAPS_LMS.md) for the first. Triage of both is 2.3.

Read directly from the FRED source (`FRED-front`, `FRED-back`) rather than from
memory. Severity legend matches 2.1:

|             | Meaning                                                             |
| ----------- | ------------------------------------------------------------------- |
| **Blocker** | FRED could not be built on the starter without changing the starter |
| **Major**   | Possible, but you would fight the abstraction the whole way         |
| **Minor**   | Local workaround is acceptable                                      |
| **Fits**    | The starter already handles this                                    |

FRED is deliberately the opposite shape to leather-production: one page, no
routes, no tables, no offline, and a map instead of a form-and-grid. It is the
better stress test of the two.

---

## The headline: FRED consumes nothing

### F1 — 40 primitives reinvented, because adoption never happened — **Major**

`FRED-front/package.json` has **no dependency on `@rgo/front-ui` or any
`@vireocodedev/*` package.** Instead `src/shared/components/` contains 40
hand-rolled `Fred*` primitives:

> FredAutocomplete, FredCheckboxBlankSvg, FredCheckboxCheckedSvg, FredChip,
> FredChipButton, FredColorPicker, FredConfirmDialog, FredDatePicker,
> FredDateTimePicker, FredDialog, FredDialogHeader, FredDialogHeaderContent,
> FredFireRelationInput, FredForm, FredGeoPointInput, FredGrowTransition,
> FredIcon, FredIconButton, FredImage, FredLabelBox, FredLabelData,
> FredLabelDataList, FredLoader, FredLoaderSuspense, FredLogoSvg,
> FredNumberField, FredPasswordField, FredProtect, FredSelect, FredSlider,
> FredSnack, FredSnackAction, FredStopwatch, FredSubmitButton, FredTable,
> FredTabPanel, FredTabsContainer, FredToolbarButton, FredTooltip,
> **FredVideoStreamPlayer**

Most have a direct `Rgo*` counterpart. This is the clearest available evidence
that the starter's adoption barrier is real rather than theoretical — a team
inside the same company, on the same stack, with the same conventions, wrote its
own instead.

The interesting question for 2.3 is _why_. The probes below suggest an answer:
almost every starter abstraction above the primitive layer assumes routes,
tables, and a submit-based form cycle, and FRED has none of those.

---

## Probe 1 — "Where does a full-bleed map surface live in the shell modes?"

### F2 — `bare` mode is a genuinely good host — **Fits**

[packages/shell/src/shell/layout/presets/AppBareShellLayout.tsx](../packages/shell/src/shell/layout/presets/AppBareShellLayout.tsx)
gives exactly what a map needs: no nav rail, `flex: 1, minHeight: 0`, a single
`<main>`, plus skip-link, PWA banner and window-controls-overlay handling for
free. This probe's literal question has a clean answer, which was not the
expected result.

### F3 — but `shell.mode` is one global value per app — **Major**

```ts
shell: {
  mode: AppShellMode;   // "dashboard" | "public" | "bare"
  ...
}
```

`mode` sits on `AppConfig`, not on a route. An app is _entirely_ bare or
_entirely_ dashboard. FRED today is one page so it would survive, but the moment
it grows an admin screen — user management, area configuration — it needs a
dashboard shell alongside the bare map, and the config cannot express that.

This is the same defect as LMS's G7 seen from the other side: in LMS the mode
axis was too coarse _across roles_, here it is too coarse _across routes_.

### F4 — the shell requires a router FRED does not have — **Major**

`react-router-dom` is in `FRED-front/package.json` and **imported nowhere in
`src/`**. `App.tsx` is:

```tsx
<Providers list={PROVIDERS}>
  <HomePage />
</Providers>
```

Adopting the shell means adopting `<Outlet />`, and `AppConfig.routes` requires
five populated keys — `login`, `authenticated[]`, `loginPage`,
`authenticatedEntryPage`, `unauthorizedPage` — before anything renders. That is
a substantial tax on a single-page app whose login is a floating panel
(`{!isAuthenticated && <LoginPanel />}`), not a route.

### F5 — app chrome is floating panels, not nav slots — **Major**

FRED's chrome is a fixed-position overlay layer:

```css
.top-panels-container {
  position: fixed;
  top: 16px;
  left: 96px;
  right: 16px;
  z-index: 1;
  pointer-events: none;
}
.top-panels-container > * {
  pointer-events: auto;
}
```

Seven panels — navigation, my-area, layers, toolbar-actions, zoom, footer, login
— float over the map and pass pointer events through the gaps. The starter's
extension points (`navSlots`, `navControls`, `accountSlot`) are all shaped like
"put a thing in the nav rail". None of FRED's chrome would use them.

### F6 — `mobileBottomNavigation` is a required config key — **Minor**

Required even in `bare` mode, so a map app must still declare
`authenticatedItems`, `loginItem` and `moreItem`.

---

## Probe 2 — "Geometry draw and edit state — does the form and mutation pattern apply, or fight it?"

**It applies for the form half and fights hard on the mutation half.**

### F7 — the form layer fits, including the create/update discriminator — **Fits**

`SurfaceInteraction.tsx` uses react-hook-form with a zod schema
(`surfaceSchema`), typed defaults, and `FredFormGroup = "create" | "update"` —
the same discriminator leather-production expresses as
`form: { group: CREATE } | { group: UPDATE; xId }`. Same idea, arrived at
independently. Encouraging.

### F8 — but editing is a live projection, not a submit cycle — **Major**

`useFormInteraction` is the crux:

```ts
const form = useForm<REQUEST>(rhfProps);
const currentValue = form.watch();

React.useEffect(() => {
  if (!formFeature) return;
  formFeature.loadFeatureSystem(mapper(currentValue));
}, [map, currentValue, formFeature, mapper]);
```

`form.watch()` with no argument subscribes to **every** field, and each change
re-renders the geometry on the map. The form is a live two-way binding to a
rendered object, not a buffer that is validated and posted. Dragging a polygon
vertex writes into form state; typing a radius redraws the map.

The starter's form components assume a dialog that opens with defaults, collects
edits and submits once. Nothing in that model is _hostile_ to live binding, but
nothing supports it either — and the starter's overlay/dialog conventions
(`useDelayedOverlayMount`, `usePageOverlayModes`) are built around the
open-edit-submit-close rhythm.

### F9 — **zero `useMutation` in the entire codebase** — **Major**

A grep for `useMutation` across all of `FRED-front/src` returns nothing. Writes
call `api.*` from `src/infrastructure/rest/` directly and then invalidate by hand
with `useQueryClient`. Every starter convention layered on top of mutations —
`createEntitySearchQuery`, the offline-aware `api` wrapper, per-entity
invalidation — has no anchor point here.

Contrast with LMS's G13, where the app built an _elaborate_ invalidation layer.
Three apps, three unrelated write-path conventions.

### F10 — geometry state is an imperative object graph plus an event bus — **Major**

The map is a mutable object reached through `useMap()`:
`map.startDrawing(DrawingClass, cb)`, `map.stopDrawing()`, `map.setCursor("lasso")`,
`map.fireHistoryLayer.active.value`. Cross-component coordination goes through a
global bus:

```ts
olEventService.emit("geometry:cleanup", { fromCreateNew: true });
olEventService.emit("geometry:change");
```

`olEventService` is built on `tseep` — **the same event-bus library bundled in
`front-ui` and dropped from the starter** (2.1, G0/G17). Two of three apps
independently needed a bus.

### F11 — React StrictMode is actively worked around — **Minor**

`useEffectNoStrict` exists because OpenLayers interaction setup is not
idempotent, and `GeoJsonProvider` uses it for layer loading. Any starter
abstraction that wraps effect-driven resource setup will meet the same problem.

---

## Probe 3 — "Live video panel placement and lifecycle"

### F12 — the starter's player is the better implementation — **Fits**

`FredVideoStreamPlayer` is 30 lines: create, remove on unmount. The starter's
`RgoVideoStreamPlayer` (142 lines, now behind the `./video` subpath from step
1.6) adds an error state, a retry button, explicit teardown before re-init, and
volume control. FRED would gain by switching.

### F13 — except it hardcodes English UI copy — **Major**

```tsx
<Typography variant="h6" align="center" color="error.main">
  Error Loading Stream
</Typography>
<Typography variant="body2" ...>
  Unable to connect to the video stream. Please check the URL and try again.
</Typography>
<Button ... >Retry</Button>
```

Three untranslated strings in a component published from a monorepo that ships
`@vireocodedev/starter-localization` and whose sibling components take a
translation function. FRED is fully internationalised, so it could not adopt this
component without forking it — which is plausibly part of why it didn't.

**This is a defect for every consumer, not just FRED**, and it is cheap to fix.

### F14 — placement is dialog-based and unbounded — **Minor**

Two mount points, both dialogs: `LiveStreamData` (from the navigation panel list)
and `DroneDialog` (from clicking a drone on the map). Lifecycle is therefore tied
to dialog open/close, which the `useEffect` cleanup handles correctly.

`LiveStreamDataList` maps over every drone with a `streamUrl`
(`sigDronesWithLiveStream`) and renders one player each — N concurrent WebRTC
sessions with no pooling or cap. Neither implementation offers a limit. An app
concern rather than a starter gap, but a starter that owns the player is the
natural place to solve it.

---

## Probe 4 — "Offline behaviour when the primary data is spatial rather than rows"

### F15 — FRED has no offline story at all — **Fits (vacuously)**

No service worker, no `VitePWA`, no IndexedDB, no persistence of any kind. A grep
for `serviceWorker|VitePWA|indexedDB|IDBClient` across `src/` and
`vite.config.ts` returns nothing. The app requires connectivity, which for a
live fire-response tool is a decision worth questioning — but it is _their_
decision, not a starter gap.

### F16 — the starter's largest investment is inapplicable here — **Major (scope finding)**

The starter's offline model is SQLite-WASM tables, `bindSqliteSearchColumns`, a
row-shaped sync queue and negative temporary IDs. FRED's primary data is:

- **GeoJSON vector layers**, cached in memory per area by `olGeoJsonCacheService`
- **GeoTIFF rasters** (`fwi`, `fdi`, `dfdi` fire indices) fetched per day
- **live telemetry** streamed from Redis consumers on the backend

None of that is rows, and none of it round-trips through a table. Making FRED
work offline would need tile/raster caching and geometry diffing — a completely
separate mechanism.

Combined with LMS's IndexedDB implementation (G16), that is **three apps and
three unrelated persistence answers**. Offline is the starter's biggest
investment and its least transferable one.

---

## Cross-cutting

### F17 — authorisation is role-only, plus a tenant scope — **Major**

```tsx
export function FredProtect({ children, role, companyId }: FredProtectProps) {
  if (!isAuthenticated || !user) return <></>;
  if (companyId && user.companyId !== companyId) return <></>;
  if (role === undefined) return <>{children}</>;
  return anyRoles.includes(user.role) ? <>{children}</> : <></>;
}
```

Two findings. First, there is **no named-permission concept at all** — FRED
checks roles directly, a step below both LMS and leather-production. Second, the
`companyId` check is a **tenant scope**, enforced server-side by
`CompanyIdValidator.java`.

This confirms 2.1's G11 as the strongest structural theme: LMS scopes by active
shift, FRED scopes by tenant, and the starter's permission check takes a
permission and nothing else.

### F18 — provider composition keeps being rebuilt — **Minor**

```tsx
export const Providers = ({ children, list }) => <>{list.reduceRight(nest, children)}</>;
```

FRED has `PROVIDERS: Provider[]`; leather-production has `app.providers.ts`. Same
flat-list-instead-of-nesting-pyramid idea, twice, absent from the starter.

---

## Summary

| ID  | Gap                                                       | Severity |
| --- | --------------------------------------------------------- | -------- |
| F1  | 40 primitives reinvented; consumes no shared library      | Major    |
| F3  | `shell.mode` is global per app, not per route             | Major    |
| F4  | Shell requires a router and 5 route config keys           | Major    |
| F5  | Chrome is floating panels, not nav slots                  | Major    |
| F8  | Geometry editing is a live projection, not a submit cycle | Major    |
| F9  | Zero `useMutation`; write path is bespoke                 | Major    |
| F10 | Imperative map object graph + global event bus            | Major    |
| F13 | `RgoVideoStreamPlayer` hardcodes English copy             | Major    |
| F16 | Row-shaped offline model inapplicable to spatial data     | Major    |
| F17 | Role-only checks plus tenant scope; no permissions        | Major    |
| F6  | `mobileBottomNavigation` required even when bare          | Minor    |
| F11 | StrictMode worked around via `useEffectNoStrict`          | Minor    |
| F14 | Unbounded concurrent video streams                        | Minor    |
| F18 | Provider composition rebuilt per app                      | Minor    |
| F2  | `bare` shell mode hosts a full-bleed map                  | **Fits** |
| F7  | react-hook-form + zod + create/update group               | **Fits** |
| F12 | Starter's video player beats FRED's                       | **Fits** |
| F15 | No offline expectations to violate                        | **Fits** |

**No blockers, ten majors, four minors, four clean fits.**

FRED scores _better_ than LMS on blockers and worse on adoption: nothing stops it
from using the starter, and it uses none of it.

---

## Common themes across 2.1 and 2.2

Input to triage in 2.3. Per the roadmap's own rule, themes appearing in both
prototypes are structural rather than incidental.

| Theme                                | LMS                                       | FRED                    | Verdict                                                                                          |
| ------------------------------------ | ----------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| **Contextual permission scope**      | shift (G11)                               | tenant (F17)            | **Strongest structural gap.** Two domains, two different second dimensions, neither expressible. |
| **Shell mode is the wrong axis**     | varies by role (G7)                       | must vary by route (F3) | Structural. The axis is wrong in two different directions.                                       |
| **Live data = signals, not queries** | 31 signal stores (G3)                     | 17 signal stores        | Structural. Both bypass react-query for operational state.                                       |
| **Global event bus**                 | `tseep` in front-ui (G17)                 | `olEventService` (F10)  | Structural, and the starter _removed_ it.                                                        |
| **Bespoke write path**               | elaborate invalidation (G13)              | zero mutations (F9)     | Divergent, not common — three apps, three answers.                                               |
| **Offline**                          | IndexedDB (G16)                           | none (F15)              | Divergent. Three apps, three answers. Least transferable investment.                             |
| **Primitives get reinvented**        | consumes front-ui, starter dropped 4 (G0) | reinvented 40 (F1)      | Structural. Adoption barrier is real.                                                            |

Two candidates stand out for 2.4:

1. **Scoped permissions** — required independently by both domains, small, and
   purely additive to `TPermission`.
2. **Restoring what the starter dropped** (G0) — `RgoOfflineCacheService`,
   `RgoWebWorkerService`, `RgoSnackbarProvider`, an event bus — since the starter
   is currently behind its own ancestor.

And one cheap fix that needs no triage: **F13**, the untranslated strings in a
published component.

All of the above were triaged in 2.3 — see [GAPS_TRIAGE.md](GAPS_TRIAGE.md) for
the decision on every gap and the scoped work items for 2.4.
