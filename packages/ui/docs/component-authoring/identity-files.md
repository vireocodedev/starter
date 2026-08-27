# Vireo identity files

Every first-class public Vireo MUI component has one colocated `VireoComponent.identity.ts` file. It owns the component's canonical runtime name and ordered public slot identities so every integration point uses the same stable values.

[`VireoOverlayHeader.identity.ts`](../../src/capabilities/overlays/components/overlays/VireoOverlayHeader/VireoOverlayHeader.identity.ts) is the reference implementation.

## Required shape

An identity file contains the component name, its public slot tuple, and the slot-name union derived from that tuple:

```ts
import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

/** Stable component name shared by every VireoComponent integration point. */
export const VIREO_COMPONENT_NAME = "VireoComponent";

/** Canonical public slots exposed by VireoComponent, in rendered DOM order. */
export const VIREO_COMPONENT_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;

/** Public slot names exposed by VireoComponent. */
export type VireoComponentSlotName = (typeof VIREO_COMPONENT_SLOTS)[number];
```

This file is a dependency leaf for the component's structural identity. It may import shared type-only authoring utilities, but it must not import the component implementation, classes, styled slots, or public props.

## Component name

Name the component constant by converting the complete PascalCase component name to `SCREAMING_SNAKE_CASE` and appending `_NAME`:

- `VireoOverlayHeader` becomes `VIREO_OVERLAY_HEADER_NAME`.
- `VireoActionMenu` becomes `VIREO_ACTION_MENU_NAME`.

Do not add `as const` to the name. A `const` initialized directly with a string literal already retains its literal type, allowing it to serve as both a runtime name and a computed TypeScript key.

Use the name wherever code registers, looks up, or reports the component's runtime identity:

- `useThemeProps({ name })` in `VireoComponent.tsx`.
- `VireoComponent.displayName` in `VireoComponent.tsx`.
- `name` in every MUI `styled()` slot in `VireoComponent.styled.ts`.
- `generateUtilityClass` and `generateUtilityClasses` in `VireoComponent.classes.ts`.
- Computed MUI theme-augmentation keys in `VireoComponent.types.ts`.
- Component theme keys and test-suite names in tests and stories.

```ts
const props = useThemeProps({
  props: inProps,
  name: VIREO_COMPONENT_NAME,
});

VireoComponent.displayName = VIREO_COMPONENT_NAME;
```

## Public slot tuple

`VIREO_COMPONENT_SLOTS` is the canonical ordered list of public rendered slots. Use lowercase camelCase names, with `root` first and remaining slots in rendered DOM order:

```ts
export const VIREO_OVERLAY_HEADER_SLOTS = [
  "root",
  "leadingAction",
  "title",
  "actions",
  "closeButton",
  "closeIcon",
] as const satisfies VireoSlotNameTuple;
```

The shared `VireoSlotNameTuple` constraint guarantees that every Vireo component declares at least `root` and keeps it first. `as const` preserves each entry as a string literal and makes the tuple readonly.

Do not add conditional state class names such as `disabled`, `selected`, or `sticky` to this tuple. Those are class states, not independently rendered or replaceable component slots.

## Derived slot-name type

Derive the singular slot-name union directly from the tuple:

```ts
export type VireoComponentSlotName = (typeof VIREO_COMPONENT_SLOTS)[number];
```

Never repeat the union manually. Adding a tuple entry must immediately update every dependent type.

Use the slot tuple or derived union wherever another structure must cover every public slot:

- `VireoComponentClasses` in `VireoComponent.classes.ts`.
- The array passed to `generateUtilityClasses`.
- `VireoComponentSlots` in `VireoComponent.types.ts`.
- The render-time utility-class map in `VireoComponent.tsx`.
- Any future typed default-slot or implementation registry.

For example:

```ts
export type VireoComponentSlots = {
  [TSlotName in VireoComponentSlotName]: React.ElementType;
};
```

```ts
const slots = {
  root: ["root"],
} as const satisfies UtilityClassSlotMap<VireoComponentSlotName, VireoComponentClassKey>;
```

Changing the tuple then causes TypeScript to identify dependent registries that no longer cover every public slot.

## Enforcement boundary

The tuple enforces completeness only where another structure is explicitly connected to `VireoComponentSlotName`. It can verify typed slot maps, class records, slot-prop definitions, and registries. By itself, it cannot prove that JSX renders a slot, a matching styled component exists, or tests and stories exercise it.

Generator output, implementation review, and component tests remain responsible for those behavioral requirements.

## What remains separate

The identity file does not contain:

- Conditional state class names or class-generation behavior.
- Owner state, props, slot-prop override interfaces, or theme augmentation.
- Styled components or default slot implementations.
- Story titles, descriptions, or other display copy.
- Component behavior or styling.

Human-readable prose may continue to spell the component name directly. JSDoc, documentation headings, and explanatory text are not runtime identity integration points and should remain readable without interpolation.

Storybook 9 `meta.title` is an additional static-tooling exception. Its CSF indexer requires a string literal and rejects a title assembled from `VIREO_COMPONENT_NAME`. Keep the literal's component segment synchronized with the identity; component templates should derive both from the same generator input.

## Visibility

The identity exports are internal implementation infrastructure. Colocated component files import them directly, but the component barrel must not re-export `VireoComponent.identity.ts` and the package root must not expose it publicly.

Consumers configure the component through its supported props, slots, classes, and MUI theme key; they do not need the identity module itself.

## Generator baseline

A component generator initially creates the mandatory root-only tuple:

```ts
import type { VireoSlotNameTuple } from "@/core/utils/muiutils";

export const VIREO_COMPONENT_SLOTS = ["root"] as const satisfies VireoSlotNameTuple;
```

When a developer adds another slot, the derived union changes and TypeScript reports incomplete dependent structures. The generator supplies the baseline; the identity tuple drives subsequent compiler feedback.

## Review checklist

- The file is named `VireoComponent.identity.ts`.
- `VIREO_COMPONENT_NAME` contains the canonical PascalCase name.
- `VIREO_COMPONENT_SLOTS` satisfies `VireoSlotNameTuple`, starts with `root`, and follows rendered DOM order.
- The slot tuple contains public slots only, never conditional state classes.
- `VireoComponentSlotName` is derived from the tuple.
- Runtime name integration points import the name instead of repeating its string.
- Complete slot structures derive from or are checked against the slot-name union.
- Human-facing prose does not import identity constants unnecessarily.
- The identity module remains free of component implementation dependencies.
- The identity module is not publicly barrel-exported.
