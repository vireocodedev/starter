# Vireo component public API files

Every first-class public Vireo component has a colocated `index.ts` file. This file is the component directory's public API boundary: it exposes the supported consumer contract while keeping implementation-only modules private.

[`VireoOverlayHeader/index.ts`](../../src/overlay/VireoOverlayHeader/index.ts) is the reference implementation.

## Required exports

A component `index.ts` must export at least these three modules, in this order:

```ts
export * from "./VireoComponent";
export * from "./VireoComponent.classes";
export * from "./VireoComponent.types";
```

These exports provide the complete minimum public API:

- `VireoComponent` provides the React component.
- `VireoComponent.classes` provides its utility-class types, generator, and generated class record.
- `VireoComponent.types` provides its props, slots, owner state, extension interfaces, and MUI theme augmentation.

Keep the standard three exports together and preserve their order across every component directory.

## Additional public exports

The index may export more modules when the component owns additional APIs that consumers genuinely need. Add those exports after the standard three:

```ts
export * from "./VireoComponent";
export * from "./VireoComponent.classes";
export * from "./VireoComponent.types";
export * from "./VireoComponentContext";
export * from "./useVireoComponent";
```

Examples of justified additional exports include:

- A public companion component.
- A public hook or context consumers need to integrate with the component.
- Additional public types that live in a separate focused module.
- A runtime helper deliberately supported as part of the package contract.

Do not add an export merely because another file exists in the directory. Every additional export becomes part of the supported public API and must be documented, tested, versioned, and maintained accordingly.

## Private modules

Implementation infrastructure must remain directly imported by colocated source files and absent from `index.ts`. In particular, do not export:

- `VireoComponent.identity.ts`
- `VireoComponent.styled.ts`
- `VireoComponent.test.tsx`
- `VireoComponent.stories.tsx`
- Private hooks, utilities, fixtures, or test helpers

The identity and styled modules coordinate internal MUI implementation details. Consumers customize the component through its public props, slots, classes, and theme augmentation rather than importing those internals.

## Package-level export

The package root should export the component directory rather than reaching into each component module:

```ts
export * from "@/path/to/VireoComponent";
```

This creates one deliberate path from the component's local public API to the package public API:

```text
component modules
      ↓
VireoComponent/index.ts
      ↓
packages/ui/src/index.ts
      ↓
package consumers
```

Consumers should import from the package's supported entry point, not from internal source or distribution paths.

### Capability-bound runtime exception

When a component can only work correctly when bound to capability state, the capability entry point may selectively export the component's props and classes while withholding its raw runtime function. The colocated `index.ts` remains standard and continues to export the component for implementation code inside the owning capability. The capability `public.ts` is the stricter package-facing boundary:

```ts
export * from "./components/forms/VireoBoundComponent/VireoBoundComponent.classes";
export type * from "./components/forms/VireoBoundComponent/VireoBoundComponent.types";
export * from "./hooks/useCapabilityFacade/useCapabilityFacade";
```

The façade must expose the bound component through its supported API, such as `form.Form`. Use this exception only when rendering the raw component would bypass required context or state; ordinary Vireo components continue to be re-exported through their directory barrel.

## Export style

Use extensionless relative module specifiers in source and named exports from the underlying modules. Vireo components do not use default exports.

The component barrel uses `export *` so the owning module remains the single declaration site for its public values and types. Avoid repeating a manually maintained list of names in `index.ts` unless an explicit rename or conflict requires it.

If two modules introduce the same exported name, resolve the collision deliberately. Do not rely on ambiguous star-export behavior.

## API stability

Treat every change to `index.ts` as a public API decision:

- Adding an export makes a new API available to consumers.
- Removing or renaming an export is a breaking change.
- Accidentally exporting an internal module creates an API consumers may start depending on.

After changing component exports, run the package's public-surface verification and add the appropriate changeset when the published API changes.

## Review checklist

- The file is named `index.ts` and is colocated with the component modules.
- It exports `VireoComponent`, `VireoComponent.classes`, and `VireoComponent.types` in that order.
- Any additional export is an intentional, supported consumer API.
- Identity, styled, test, story, and other private modules are not exported.
- The package root exports the component directory rather than its internal files.
- No default export is introduced.
- Export-name collisions are resolved explicitly.
- Public-surface verification passes.
- Published API changes have an appropriate changeset.
