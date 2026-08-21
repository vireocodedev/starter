# Vireo utility-class files

Every first-class public Vireo MUI component keeps its utility-class contract in a colocated `VireoComponent.classes.ts` file. The file defines the stable class names consumers, tests, component rendering, and MUI theme customization use to address the component's public styling regions.

[`VireoOverlayHeader.classes.ts`](../../src/overlay/VireoOverlayHeader/VireoOverlayHeader.classes.ts) is the reference implementation.

## Required shape

After imports, a classes file is ordered as follows:

1. `VireoComponentClasses`
2. `VireoComponentClassKey`
3. `getVireoComponentUtilityClass`
4. `vireoComponentClasses`

```ts
import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import { VIREO_COMPONENT_NAME, VIREO_COMPONENT_SLOTS, type VireoComponentSlotName } from "./VireoComponent.identity";

/** Utility classes available to VireoComponent. */
export type VireoComponentClasses = Record<VireoComponentSlotName, string>;

/** Valid keys for VireoComponent utility classes and theme style overrides. */
export type VireoComponentClassKey = keyof VireoComponentClasses;

/** Returns the generated utility class name for a VireoComponent slot or state. */
export function getVireoComponentUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_COMPONENT_NAME, slot);
}

/** Generated utility class names keyed by each public VireoComponent class key. */
export const vireoComponentClasses: VireoComponentClasses = generateUtilityClasses(VIREO_COMPONENT_NAME, [
  ...VIREO_COMPONENT_SLOTS,
]);
```

The component name and public slot tuple must come from the colocated identity file. See [Vireo identity files](./identity-files.md). Do not repeat either contract in this file.

## Classes type

`VireoComponentClasses` is the closed record of public utility-class keys. For a component with slot classes only, derive it directly from `VireoComponentSlotName`:

```ts
export type VireoComponentClasses = Record<VireoComponentSlotName, string>;
```

Use a `type`, not an `interface`: consumers may supply values for existing keys through the `classes` prop, but they cannot make the component generate or apply a new class by augmenting its TypeScript declaration.

Document the complete contract on `VireoComponentClasses`; do not add repetitive JSDoc to individual class properties. Slot ordering and names belong to the canonical identity tuple.

## Class keys

`VireoComponentClassKey` is derived rather than maintained separately:

```ts
export type VireoComponentClassKey = keyof VireoComponentClasses;
```

The component's direct `VireoThemeComponent` augmentation consumes this union to type `theme.components.VireoComponent.styleOverrides` keys. Deriving it ensures the theme contract cannot drift from the public utility-class record without adding the component to MUI's compiler-expensive global class-key map.

## Singular utility-class generator

`getVireoComponentUtilityClass` generates one stable class name from the canonical component identity and a suffix:

```ts
getVireoComponentUtilityClass("root");
// "VireoComponent-root"
```

Keep the parameter typed as `string`, following MUI's utility-class helper convention. It allows `composeClasses` to request both slot keys and any supported conditional state keys.

The component implementation passes this function to `composeClasses`; consumers may also use it when they need to construct a known utility class dynamically.

## Complete utility-class record

`vireoComponentClasses` exposes generated names as a stable object:

```ts
vireoComponentClasses.root;
// "VireoComponent-root"
```

Pass a mutable copy of the canonical readonly tuple to MUI:

```ts
generateUtilityClasses(VIREO_COMPONENT_NAME, [...VIREO_COMPONENT_SLOTS]);
```

The spread is required because the installed MUI helper accepts a mutable array. The explicit `VireoComponentClasses` annotation verifies the generated record against the public class contract.

Consumers and tests should use this record instead of manually spelling generated class-name strings:

```ts
expect(root).toHaveClass(vireoComponentClasses.root);
```

## Render-time class composition

The classes file declares static keys and generates names. It does not decide which classes a particular render receives.

Keep `useUtilityClasses` in `VireoComponent.tsx` and check its mapping against the canonical slots and valid class keys:

```ts
function useUtilityClasses(ownerState: VireoComponentOwnerState, classes?: VireoComponentProps["classes"]) {
  const slots = {
    root: ["root", ownerState.disabled && "disabled"],
    label: ["label"],
  } as const satisfies UtilityClassSlotMap<VireoComponentSlotName, VireoComponentClassKey>;

  return composeClasses(slots, getVireoComponentUtilityClass, classes);
}
```

`UtilityClassSlotMap` enforces two contracts:

- Every public rendered slot must exist as a mapping key.
- Every suffix applied to a slot must be a valid class key, `false`, `null`, or `undefined`.

Adding a public slot to `VIREO_COMPONENT_SLOTS` therefore produces a compiler error until this render-time map handles it.

The mapping object's keys are rendered slots. Each value lists one or more class suffixes applied to that slot. Consequently, the mapping is not interchangeable with the flat tuple passed to `generateUtilityClasses`.

Keep this function beside the component because it depends on normalized owner state and consumer-provided classes. This also prevents `VireoComponent.classes.ts` from depending on `VireoComponent.types.ts`, which already imports the class types.

## Conditional state classes

The canonical slot tuple contains public rendered slots only. Add a state class only when consumers or theme configuration need a stable CSS hook for that state.

Extend the closed classes type without changing `VIREO_COMPONENT_SLOTS`:

```ts
export type VireoComponentClasses = Record<VireoComponentSlotName | "disabled", string>;
```

Then generate and apply the state class deliberately:

```ts
generateUtilityClasses(VIREO_COMPONENT_NAME, [...VIREO_COMPONENT_SLOTS, "disabled"]);
```

```ts
const slots = {
  root: ["root", ownerState.disabled && "disabled"],
  label: ["label"],
} as const satisfies UtilityClassSlotMap<VireoComponentSlotName, VireoComponentClassKey>;
```

Also include the matching state style in the styled slot's `overridesResolver` when the state is supported as a theme `styleOverrides` key, and test both its generated class and application condition.

Do not create a utility class merely because a value exists in owner state. Owner state can influence internal styling directly without becoming a public CSS contract.

## Consumer-provided classes

The component's `classes` prop is typed as a partial class record:

```ts
classes?: Partial<VireoComponentClasses>;
```

`composeClasses` combines the generated utility class with the consumer's value for the same key. A custom class extends the component's classes; it does not remove the stable generated class.

```tsx
<VireoComponent classes={{ root: "product-editor-header" }} />
```

The root then receives both `VireoComponent-root` and `product-editor-header`.

## Public visibility

The classes type, class-key type, singular generator, and generated record are public customization APIs. Re-export `VireoComponent.classes.ts` from the component barrel.

The identity tuple, derived slot-name type, and render-time `useUtilityClasses` function remain private implementation infrastructure.

## Review checklist

- The file is named `VireoComponent.classes.ts`.
- The canonical component name, public slot tuple, and slot-name union come from `VireoComponent.identity.ts`.
- Declarations follow the standard order.
- `VireoComponentClasses` is a closed `type`, not an augmentable `interface`.
- Slot class keys derive from `VireoComponentSlotName`.
- `VireoComponentClasses` has accurate JSDoc; individual class properties do not repeat it.
- `VireoComponentClassKey` is derived with `keyof`.
- Both utility-class generators use the identity constant.
- Base slot classes are generated from a mutable copy of the canonical slot tuple.
- Render-time class composition remains in `VireoComponent.tsx` and satisfies `UtilityClassSlotMap`.
- Conditional state classes remain separate from the public slot tuple.
- The classes module is publicly barrel-exported.
