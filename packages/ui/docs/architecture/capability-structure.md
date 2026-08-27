# Capability structure

## Purpose

This guide defines how core, top-level capabilities, child capabilities, structural folders, named modules, and private implementation boundaries are organized in `@vireocodedev/ui`.

## What qualifies as a capability

A capability is a cohesive developer-facing or user-facing area that:

- has independently evolvable behavior or contracts;
- usually contains multiple cooperating components, hooks, providers, services, state, or models;
- exposes a meaningful API from a top-level `public.ts`;
- is named for its responsibility rather than a library, MUI primitive, route, or legacy folder;
- is substantial enough that moving it to core would weaken core's ownership rules.

A standalone component is not automatically a capability. A private implementation grouping is not a capability. If two proposed capabilities constantly share private code, they are probably one capability. If their APIs are unrelated, split them.

A child capability is meaningful only in its parent. Promote it to the top level when it becomes independently reusable.

## Top-level structure

A top-level capability has this shape:

```text
capabilities/table/
  public.ts
  components/
  hooks/
  state/
  types/
  utils/
  responsive-table/
  management-table/
```

Only these entries may appear at the capability root:

- `public.ts`;
- approved structural directories;
- direct child-capability directories.

Do not place loose implementation files beside `public.ts`. Do not create empty structural directories.

`core` follows the same structural contract and owns `core/public.ts`, but it cannot contain child capabilities.

## Child capabilities

Child capabilities are flattened directly under the parent. Do not introduce a nested `capabilities` directory:

```text
capabilities/table/
  public.ts
  components/
  responsive-table/
    components/
    hooks/
    state/
  management-table/
    components/
    hooks/
```

The nesting limit is exactly one child level:

```text
capabilities/<parent>/<child>/<approved-structure>
```

Child capabilities:

- do not have `public.ts`;
- cannot contain further child capabilities;
- expose selected APIs through the parent's `public.ts`;
- may import parent-owned shared modules directly;
- may be imported directly by parent orchestration;
- must not import sibling children.

If sibling children need the same implementation, promote it to an appropriate parent structural folder. If one child fundamentally depends on another, merge them, reconsider their boundaries, or orchestrate the interaction in the parent.

A parent may exist mainly to group children. Do not invent shared code merely to populate its structural folders.

## Approved structural folders

Every folder is optional and is created only when occupied.

| Folder        | Responsibility                                                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/`     | Imported fonts, images, media, and other non-code resources shared by the owning boundary. React SVG or icon components belong in `components`. |
| `components/` | React component modules organized by the approved component categories.                                                                         |
| `constants/`  | Stable runtime values and configuration.                                                                                                        |
| `contexts/`   | React context definitions and contracts.                                                                                                        |
| `events/`     | Existing event contracts, buses, or event infrastructure. This category is provisional and reserved for migration.                              |
| `hooks/`      | Reusable React hooks.                                                                                                                           |
| `models/`     | Schemas and structured data models with runtime meaning.                                                                                        |
| `providers/`  | React providers and bootstrap boundaries owned by this capability.                                                                              |
| `services/`   | Side-effectful or stateful non-React operations.                                                                                                |
| `state/`      | Reducers, stores, state machines, and signals.                                                                                                  |
| `styles/`     | Reusable styles not owned by one component.                                                                                                     |
| `types/`      | TypeScript-only contracts shared by the owning boundary.                                                                                        |
| `utils/`      | Pure, stateless functions.                                                                                                                      |

The vocabulary deliberately excludes `api`, `offline`, `signals`, `enums`, `setup`, `common`, and `shared`:

- Integration and network structure will be defined in the deferred integrations phase.
- Signals are a state implementation and belong in `state`.
- Enum-like values belong in `types`, `constants`, or `models` according to runtime meaning.
- Setup and provider code follows its behavioral owner.
- Common and shared obscure ownership.

Event transport belongs to a reviewed integration such as `integrations/event-source`; do not add a generic in-process event bucket.

Adding another structural folder requires updating this guide and architecture enforcement first. Do not create ad hoc names locally.

## Component modules

Every component under a structural `components` folder has its own PascalCase directory beneath exactly one category:

```text
components/<category>/<PascalCaseComponent>/
```

Every public React component is a first-class `Vireo*` component and follows the canonical eight-file contract. See [Component folder categories](./component-folder-categories.md) and the [component-authoring guides](../component-authoring/component-files.md).

## Named non-component modules

Module-like hooks, contexts, providers, services, and state artifacts receive a same-named directory:

```text
hooks/
  useCapabilityState/
    useCapabilityState.ts
    useCapabilityState.types.ts
    useCapabilityState.test.ts
    useCapabilityState.stories.tsx
    internal/

providers/
  ThemeProvider/
    ThemeProvider.tsx
    ThemeProvider.test.tsx

services/
  localStorageService/
    localStorageService.ts
    localStorageService.test.ts
```

Only files the module needs are present. Root files use the module basename. Module-owned types or constants may stay in the module; contracts shared outside it move to the capability's structural folders.

Named non-component modules do not receive `index.ts`. Import their files explicitly.

## Responsive behavior

Responsive presentation is container-aware by default:

- use CSS container queries for visual layout and styling changes;
- use the page-layout capability for semantic compact and regular page behavior;
- use a capability-specific measured hook when a component must choose structurally different render trees from its container size;
- use MUI `useMediaQuery` locally only for genuinely viewport-owned behavior, such as global portals;
- use a component-internal `ResizeObserver` when calculations require raw element dimensions.

Do not create device-category wrappers, JavaScript prop selectors for ordinary responsive styling, generic window resize listeners, or public raw-size hooks without a concrete cross-capability contract. A viewport width does not identify a physical device, and window resize events do not represent container resizing.

## Flat support catalogs

Support catalogs remain flat while an artifact needs only one source file:

```text
constants/table.constants.ts
models/table.models.ts
styles/table.styles.ts
types/table.types.ts
utils/table.utils.ts
```

A support artifact may become a same-named module directory when it gains tests, private helpers, or multiple tightly related files. Do not create one-file directories or ceremonial barrels preemptively.

## Private internals

Any named module may have one optional `internal` boundary:

```text
services/
  tablePersistenceService/
    tablePersistenceService.ts
    tablePersistenceService.test.ts
    internal/
      models/
      utils/
```

The rules are strict:

1. Nothing below `internal` is exported from a component `index.ts` or capability `public.ts`.
2. Nothing outside the owning named module imports it.
3. Reused code is promoted to the owning capability.
4. `internal` may use the approved structural vocabulary where relevant.
5. It cannot contain child capabilities, `public.ts`, or another nested `internal`.
6. Remove it when empty.

An internal React component still receives its own PascalCase directory and local `index.ts`, but internal components are flat and uncategorized:

```text
internal/
  components/
    PrivatePart/
      PrivatePart.tsx
      index.ts
```

A private component uses only the files it needs. Before becoming public it must be promoted to the full Vireo component contract and an approved category.

An asset private to one named module lives under `internal/assets`. Shared assets move to the owning capability's `assets` folder.

## Fixtures

Fixtures are non-production support data, not a top-level structural category:

- Module-private fixtures live at `<module>/internal/fixtures`.
- Package-contract and cross-capability fixtures live at `packages/ui/tests/fixtures`.
- Small one-off values may remain in their test or story.
- Fixtures are never exported.

## Testing and stories

- Unit tests are colocated with their owner.
- Component tests live in component directories.
- Hook, context, provider, service, and state tests live in their named module directories.
- Flat support tests live beside the support file.
- `packages/ui/tests` is reserved for package contracts, public entry points, architecture, and cross-capability integration.
- Every public Vireo component has its mandatory colocated story.
- A public hook, provider, or context may have a colocated story when a visual demonstration materially helps.
- Private components and internals do not receive standalone stories; demonstrate them through their public owner.

## Initial capability registry

The initial migration target is:

```text
capabilities/
  application-navigation/
  application-preferences/
  country/
  forms/
    form-overlays/
  history/
  infinite-canvas/
  overlays/
    confirmation/
    page-overlays/
  page-layout/
  table/
    management-table/
    responsive-table/
  unsaved-changes/
```

Do not add generic `layout`, `navigation`, `feedback`, `inputs`, `providers`, `api`, `video`, or `events` capabilities merely to mirror current folder names. The application-navigation capability is intentionally narrower: it owns the cooperating shell surface, compact-mode, destination-item, and mobile quick-navigation contracts. Generic artifacts remain core-owned, capability-specific instances follow their owner, and integrations remain deferred.

## Review checklist

- Does this area satisfy the capability criteria rather than merely group artifacts?
- Is an independently reusable child promoted to the top level?
- Are shared child modules owned by the parent?
- Are siblings free of direct imports?
- Does the root contain only `public.ts`, approved structural folders, and direct children?
- Are empty and catch-all directories absent?
- Are non-component modules and internal boundaries following their contracts?
- Is the public API curated explicitly?
