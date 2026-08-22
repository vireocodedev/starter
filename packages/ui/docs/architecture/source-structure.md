# Source structure

## Purpose

This guide defines the target architecture for `packages/ui/src`. It is a destination contract, not a description of the legacy tree. Existing violations may remain only while they are covered by the migration ledger and the temporary architecture allowlist.

The package uses a hybrid model:

- `core` owns foundational design-system modules with no capability-specific meaning.
- `capabilities` owns independently evolvable areas of UI behavior.
- `integrations` owns adapters whose contracts or lifecycles are tied to external systems.

## Target source root

The completed source root has this strict shape:

```text
src/
  core/
  capabilities/
  integrations/
  index.ts
```

Only an unavoidable package-wide ambient declaration, such as a global CSS import declaration, may appear beside these entries. Such exceptions must be documented and enforced explicitly.

Do not recreate root artifact buckets such as `components`, `hooks`, `providers`, `services`, `utils`, or `setup`. An artifact follows the boundary that owns its behavior.

Package-wide Storybook MDX pages live in `docs/storybook`, not `src`. Colocated source stories remain with their owning modules.

Published Storybook developer tooling lives in the package-level `storybook/` directory, also outside `src`. It is built to a separate `dist/storybook/` tree and exposed only through explicit package subpaths; it is not part of the production package-root API.

```text
storybook/
  index.ts
  VireoComponent/
    index.ts
    ...component-specific presentation helpers
```

The `@vireocodedev/starter-ui/storybook` entry point owns genuinely reusable Storybook providers and presentation utilities. Component-specific helpers use an exact PascalCase subpath matching the public component, such as `@vireocodedev/starter-ui/storybook/VireoIconContainer`. Do not collect component-specific helpers into the shared entry point or hide them behind a wildcard export.

Although these helpers are published so copied examples compile in consumer projects, they remain developer tooling: production modules must not import them, package-root barrels must not re-export them, and their runtime graph must not depend on `@storybook/*` or `storybook/*` packages.

## Boundary responsibilities

### Core

`core` acts as one foundational capability. A module belongs there only when all of the following are true:

1. It is broadly reusable or foundational to the package.
2. It does not encode a particular workflow or capability.
3. Its ownership remains clear without a capability context.
4. It depends only on other core modules or external packages.

A single current consumer does not disqualify an otherwise foundational module. When ownership is ambiguous, keep the module with its consumer until demonstrated reuse justifies promotion.

Core uses the approved structural folders and component categories described in the linked guides. It has `core/public.ts`, but it cannot contain child capabilities.

### Capabilities

Each top-level capability owns a cohesive developer-facing or user-facing area with independently evolvable behavior and a meaningful public API. Its package-facing boundary is `capabilities/<name>/public.ts`.

Capabilities may contain at most one level of child capabilities. See [Capability structure](./capability-structure.md) for qualification, ownership, and folder rules.

### Integrations

`integrations` owns adapters whose public contracts or lifecycles are coupled to external runtimes. Each finalized integration has a kebab-case directory and an explicit `public.ts` package boundary. Sonner notifications, TanStack Query boundaries and mutation extensions, and typed Hello Pangea DnD primitives establish the current structure; remaining code tied to i18next, OvenPlayer, or another external runtime stays in the migration inventory until its integration contract is designed.

Do not create a capability merely to hide integration code. Not every external import creates an integration either: an external package may be an implementation dependency of a genuine capability.

## Public entry points

`public.ts` and `index.ts` have different meanings:

- `public.ts` is an explicit package-facing boundary. It exists only in `core` and top-level capabilities.
- `index.ts` is a React component module barrel. It is required in each component directory and is not used as a general directory barrel.

`capabilities/` has no aggregate `index.ts` or `public.ts`. The package root names every public boundary directly:

```ts
export * from "./core/public";
export * from "./capabilities/table/public";
export * from "./capabilities/overlays/public";
```

Component APIs may be re-exported from their curated component `index.ts`. Non-component APIs are named explicitly:

```ts
export * from "./components/data-display/VireoTable";
export { useTableState } from "./hooks/useTableState/useTableState";
export type { TableRowId } from "./types/table.types";
```

Never export an entire structural directory or anything below `internal`.

## Dependency rules

The dependency direction is mandatory:

```text
external packages
       ↑
     core
       ↑
top-level capabilities
       ↑
parent orchestration and child capabilities
```

More precisely:

1. Core cannot depend on capabilities.
2. A top-level capability may depend on core through `core/public.ts`.
3. A top-level capability may depend on another top-level capability only through that capability's `public.ts`.
4. The top-level capability graph must remain acyclic.
5. A child may import its parent's shared modules directly.
6. A parent may import a child directly to orchestrate it.
7. Sibling children must not import each other. Shared code moves to the parent.
8. Consumers outside a child use the parent capability's `public.ts`; children have no `public.ts`.
9. Internal source never imports the package-level `src/index.ts`.

Frequent or bidirectional cross-capability dependencies indicate incorrect ownership: merge the capabilities or promote genuinely foundational code to core.

## Import paths

Use relative imports only within one named module directory:

```ts
import type { VireoTableProps } from "./VireoTable.types";
```

Use the `@/` alias whenever an import crosses module directories, even inside one capability:

```ts
import type { TableRowId } from "@/capabilities/table/types/table.types";
```

Cross-boundary imports target public entry points:

```ts
import { VireoOverlayHeader } from "@/capabilities/overlays/public";
import { VireoLabelBox } from "@/core/public";
```

Avoid deep `../../..` paths. Files within the same top-level capability may import owned siblings directly; the `public.ts` boundary is for callers outside the owner.

## Naming

- Capability and child-capability directories use descriptive kebab-case noun phrases. Do not force singular or plural forms.
- Public component directories and exports use `Vireo`-prefixed PascalCase names.
- Private component directories use PascalCase; they do not require the `Vireo` prefix.
- Hook directories, files, and exports match a `usePascalCase` name.
- Context and provider directories and files use PascalCase matching their primary export.
- Service and state directories and files use camelCase matching their primary export.
- Flat support files use a semantic basename plus their structural suffix, such as `table.types.ts` or `overlay.constants.ts`.
- Tests and stories preserve the source basename.

Do not introduce ambiguous catch-all names such as `shared`, `common`, `helpers`, `misc`, or `general`. The approved `utils` folder is limited to pure, stateless functions.

## Supported package API

During structural migration:

- Every symbol exported from the package root remains available.
- Every subpath declared in `package.json` exports remains available.
- Imports into `src` or undeclared implementation paths are not compatibility guarantees.
- Deprecated `Rgo*` names may remain as thin compatibility exports until a separate removal decision.

The `./country` export will map to the country capability. The `./video` export will eventually map to the deferred OvenPlayer integration. The `./api` export remains a compatibility surface assembled from its eventual owners; it does not justify an API capability.

Integration APIs are exposed only through named package subpaths such as `./sonner` and `./tanstack-query`. They are not re-exported from the package root, which keeps optional peer dependencies outside the foundational runtime graph.

## Enforcement

Architecture enforcement is mandatory in CI once the tooling phase begins:

- A repository architecture test checks filesystem names, depth, approved folders, component contracts, barrels, and empty directories.
- ESLint checks import boundaries and forbidden entry-point imports.
- The capability dependency graph is derived from source imports and checked for cycles; there is no separate dependency manifest.
- Known legacy violations are individually allowlisted. A rule is never disabled wholesale.

New or moved code must satisfy the target architecture immediately. See [Migration](./migration.md) for allowlist and completion rules.

## Related guides

- [Capability structure](./capability-structure.md)
- [Component folder categories](./component-folder-categories.md)
- [Migration](./migration.md)
- [Vireo component authoring](../component-authoring/component-files.md)
