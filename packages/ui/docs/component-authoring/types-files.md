# Vireo component type files

Every first-class public Vireo MUI component keeps its complete type contract in a colocated `VireoComponent.types.ts` file. The type file connects the component's normalized owner state, replaceable slots, public props, inherited root props, and MUI theme registration.

This convention applies to components intentionally published as `Vireo*` design-system components. Internal React helpers, providers, contexts, and application-level compositions do not automatically require this complete contract.

[`VireoOverlayHeader.types.ts`](../../src/capabilities/overlays/components/overlays/VireoOverlayHeader/VireoOverlayHeader.types.ts) is the reference implementation.

## Declaration rule

Use `interface` only when declaration merging is an intentional, supported extension mechanism. Use `type` for every closed contract.

| Declaration                               | Form        | Reason                                                    |
| ----------------------------------------- | ----------- | --------------------------------------------------------- |
| `VireoComponentOwnerState`                | `type`      | Closed state calculated by the component                  |
| `[COMPONENT][SLOT]SlotPropsOverrides`     | `interface` | Deliberately augmentable for one public slot              |
| `VireoComponentSlots`                     | `type`      | Closed map derived from the canonical public slot names   |
| `VireoComponentSlotsAndSlotProps`         | `type`      | Composition produced by MUI slot utilities                |
| `VireoComponentOwnProps`                  | `type`      | Closed component-owned prop contract                      |
| `VireoComponentInheritedProps`            | `type`      | Closed inherited root prop contract                       |
| Component-specific supporting contracts   | `type`      | Usually unions, intersections, or closed object contracts |
| `VireoComponentProps`                     | `type`      | Final intersection of the public prop contracts           |
| Interfaces inside MUI module augmentation | `interface` | Must merge with MUI declarations                          |

Do not use an interface merely because a declaration happens to describe an object. An interface communicates that consumers are allowed to augment that declaration.

## Required order

After imports, order the standard sections by dependency:

1. `VireoComponentOwnerState`
2. One `[COMPONENT][SLOT]SlotPropsOverrides` interface per public slot
3. `VireoComponentSlots`
4. `VireoComponentSlotsAndSlotProps`
5. `VireoComponentOwnProps`
6. `VireoComponentInheritedProps`
7. Optional component-specific supporting contracts
8. `VireoComponentProps`
9. MUI theme augmentation

Place a component-specific supporting type immediately before the first major declaration that consumes it when an earlier section needs it. Dependency order takes precedence over forcing an arbitrary custom type into step seven.

The standard dependency flow is:

```text
OwnerState
    ↓
SlotPropsOverrides + Slots
    ↓
SlotsAndSlotProps
    ↓
OwnProps + InheritedProps + component-specific contracts
    ↓
Props
    ↓
MUI theme augmentation
```

## Owner state

Define normalized and derived state shared with styled slots and slot-prop callbacks as a closed type:

```ts
export type VireoOverlayHeaderOwnerState = {
  sticky: boolean;
  closable: boolean;
  closeDisabled: boolean;
  hasLeadingAction: boolean;
  hasActions: boolean;
};
```

Owner state is not React `useState`, another public prop, or an augmentation hook. It is a read-only snapshot created by the component for the slots it owns.

Public props may be optional while their resolved owner-state values are required:

```text
sticky?: boolean
      ↓ default resolution
sticky: boolean
```

Derived facts need not exist as public props:

```text
onClose exists
      ↓
closable: boolean
```

Include only facts that rendering, styling, utility classes, theme variants, or slot customization need to observe. Do not duplicate values separately when they already exist in owner state, and do not invent fields merely to populate the type.

The component constructs owner state after applying defaults:

```ts
const { closeDisabled = false, sticky = true } = props;

const ownerState: VireoOverlayHeaderOwnerState = {
  sticky,
  closable: onClose !== undefined,
  closeDisabled,
  hasLeadingAction: leadingAction !== undefined && leadingAction !== null,
  hasActions: actions !== undefined && actions !== null,
};
```

Library code passes the same object to every styled slot and every slot-prop resolver. MUI filters the `ownerState` prop so it remains available to the styling system without leaking onto the DOM.

Consumers do not supply `ownerState`. They may read its inferred value through a `slotProps` callback:

```tsx
<VireoOverlayHeader
  title="Edit invoice"
  slotProps={{
    root: ownerState => ({
      "data-sticky": String(ownerState.sticky),
      "aria-label": ownerState.sticky ? "Sticky overlay header" : "Overlay header",
    }),
  }}
/>
```

If a consumer does not need state-dependent slot customization, owner state remains entirely an implementation detail.

## Slot-prop override interfaces

Every public slot has exactly one corresponding augmentable interface, including `Root`:

```ts
export interface VireoOverlayHeaderRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoOverlayHeaderTitleSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
```

Keep these as interfaces because their purpose is to let consumers teach TypeScript about additional props accepted by a replacement slot. The interface adds type permission only; the replacement component implements the behavior.

Conceptually:

```ts
interface CustomTitleProps extends TypographyProps {
  emphasis?: "normal" | "strong";
}

const CustomTitle = React.forwardRef<HTMLElement, CustomTitleProps>(
  function CustomTitle({ emphasis = "normal", ...props }, ref) {
    return <Typography {...props} ref={ref} fontWeight={emphasis === "strong" ? 700 : 400} />;
  },
);
```

After augmenting `VireoOverlayHeaderTitleSlotPropsOverrides` with `emphasis`, a consumer can supply it through the matching slot props:

```tsx
<VireoOverlayHeader title="Edit invoice" slots={{ title: CustomTitle }} slotProps={{ title: { emphasis: "strong" } }} />
```

Ordinary MUI props and `sx` customization do not require augmentation. Use an override interface only for additional props belonging to a custom replacement slot.

Augmentation makes the additional prop legal even when the replacement slot is omitted. Consumers must not pass custom-only props to the default slot because unknown props may reach its DOM output. Each Vireo package must expose and consumer-type-test the documented module augmentation path; a barrel re-export alone must not be assumed to prove declaration merging works.

Use the shared [`VireoDataAttributeValue`](../../src/core/utils/muiutils.ts) for arbitrary `data-*` slot attributes instead of declaring a component-local value type.

## Slots

Derive the closed map of replaceable semantic regions from the canonical slot-name union in `VireoComponent.identity.ts`:

```ts
import type { VireoOverlayHeaderSlotName } from "./VireoOverlayHeader.identity";

export type VireoOverlayHeaderSlots = {
  [TSlotName in VireoOverlayHeaderSlotName]: React.ElementType;
};
```

The identity tuple guarantees that every Vireo component exposes `root` first and lists remaining slots in rendered DOM order. Deriving this map makes a tuple change flow into MUI's slot and slot-prop completeness checks.

Do not make `Slots` augmentable: adding a field to its type cannot make the component render a new slot. Change the canonical identity tuple and complete every resulting compiler error instead.

Because the mapped type owns names rather than default implementations, document each default on the corresponding entry in `SlotsAndSlotProps` and in consumer-facing component documentation.

## Slots and slot props

Use MUI's `CreateSlotsAndSlotProps` and `SlotProps` utilities to construct the public `slots` and `slotProps` API:

```ts
export type VireoOverlayHeaderSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoOverlayHeaderSlots,
  {
    /** @default 'header' */
    root: SlotProps<"header", VireoOverlayHeaderRootSlotPropsOverrides, VireoOverlayHeaderOwnerState>;
    /** @default Typography */
    title: SlotProps<typeof Typography, VireoOverlayHeaderTitleSlotPropsOverrides, VireoOverlayHeaderOwnerState>;
  }
>;
```

Each `SlotProps` declaration connects three contracts:

```text
SlotProps<DefaultSlotProps, SlotPropsOverrides, OwnerState>
```

- The first argument types the default slot's normal props.
- The second adds independently augmentable custom-slot props.
- The third types the owner-state callback form of `slotProps`.

Use a semantic native element type when the default rendered element is native, such as `"header"` or `"div"`. For a MUI default, use its concrete component type, such as `typeof Typography` or `typeof IconButton`.

Do not substitute a broad `React.ElementType<TypographyProps>`-style type for a known default component. `SlotProps` obtains props through `React.ComponentPropsWithRef`; a broad element type produces a large union of compatible elements and prevents the implementation from safely resolving the concrete default props. Using `typeof DefaultComponent` preserves exact prop and ref inference and avoids downstream type assertions.

`CreateSlotsAndSlotProps` requires this second map to cover every key in `VireoComponentSlots`. Adding a slot to the canonical identity tuple therefore produces a compiler error here until its `SlotProps` contract is declared.

## Own props

`OwnProps` contains the API introduced by the component itself, before inherited default-root props are added:

```ts
export type VireoOverlayHeaderOwnProps = VireoOverlayHeaderSlotsAndSlotProps & {
  title: React.ReactNode;
  titleId?: string;
  leadingAction?: React.ReactNode;
  actions?: React.ReactNode;
  sticky?: boolean;
  classes?: Partial<VireoOverlayHeaderClasses>;
};
```

It always includes `VireoComponentSlotsAndSlotProps` and the component's `classes` customization contract. Document required props, defaults, accessibility responsibilities, and non-obvious rendering guarantees with JSDoc.

`OwnProps` does not include inherited root props. Component-specific discriminated unions may also remain separate when an intersection is required to express valid combinations.

## Inherited props

Make the top-level contract inherited from the default root explicit:

```ts
/** Props VireoOverlayHeader inherits from its default root after excluding component-owned props. */
export type VireoOverlayHeaderInheritedProps = Omit<BoxProps<"header">, "children" | "component" | "onClose" | "title">;
```

Use this standardized JSDoc wording, substituting the real component name:

```text
Props VireoComponent inherits from its default root after excluding component-owned props.
```

Choose the inherited prop source from the actual default root, such as `BoxProps`, `ButtonBaseProps`, or `TypographyProps`. Exclude every inherited prop that conflicts with or bypasses the component-owned API.

For `VireoOverlayHeader`:

- `children` is excluded because the component owns its anatomy.
- `component` is excluded because root replacement goes through `slots.root`.
- `onClose` is excluded because the component defines a specialized accessible close contract.
- `title` is excluded because visible heading content replaces the native HTML tooltip meaning.

The inherited contract does not become polymorphic when `slots.root` changes. Top-level props remain based on the default root; additional replacement-root props belong in `slotProps.root` and its override interface.

## Component-specific contracts

Add descriptively named closed types when a component needs relationships that do not belong in the common sections:

```ts
export type VireoOverlayHeaderCloseProps =
  | {
      onClose: React.MouseEventHandler<HTMLButtonElement>;
      closeLabel: string;
      closeDisabled?: boolean;
    }
  | {
      onClose?: undefined;
      closeLabel?: never;
      closeDisabled?: never;
    };
```

This discriminated union prevents a close button without an accessible label and prevents close-only props when no close action exists.

Do not create a generic `SomethingCustom` declaration. Use a semantic name such as `CloseProps`, `LoadingProps`, or `ValidationProps`. These sections are optional and component-specific.

## Final props

Compose the public component contract from its named sources:

```ts
/** Props accepted by {@link VireoOverlayHeader}. */
export type VireoOverlayHeaderProps = VireoOverlayHeaderOwnProps &
  VireoOverlayHeaderCloseProps &
  VireoOverlayHeaderInheritedProps;
```

Do not leave a large inline `Omit` or conditional union inside final `Props`. Naming each source makes the public contract reviewable and gives generated API documentation a clear representation of every layer.

## MUI theme augmentation

Keep MUI augmentation last because it consumes the completed component prop and class-key contracts:

```ts
import type { VireoThemeComponent } from "@/core/utils/muiutils";
import type { VIREO_OVERLAY_HEADER_NAME } from "./VireoOverlayHeader.identity";

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_OVERLAY_HEADER_NAME]?: VireoThemeComponent<
      VireoOverlayHeaderProps,
      VireoOverlayHeaderClassKey,
      VireoOverlayHeaderOwnerState,
      Theme
    >;
  }
}
```

This registers:

- `defaultProps` with the final component props.
- `styleOverrides` with the utility class keys.
- `variants` with the final component props.

Do not add Vireo components to MUI's global `ComponentsPropsList` or `ComponentNameToClassKey` registries. MUI derives `ComponentsProps`, `ComponentsOverrides`, and `ComponentsVariants` by mapping across every registered name. Registering every Vireo component in those maps caused TypeScript to multiply the complete Vireo prop graph across the legacy MUI surface, exhausting the default Node heap. `VireoThemeComponent` keeps the same component-local theme ergonomics without expanding global mapped registries.

The computed component key must use the name exported by the colocated `VireoComponent.identity.ts` file. That same identity is used by the styled file, `useThemeProps`, and utility-class generation.

## Review checklist

- The file is named `VireoComponent.types.ts`.
- Closed contracts use `type`; only intentional declaration-merging hooks use `interface`.
- Sections follow dependency order.
- Owner state contains resolved or derived facts, not unresolved optional defaults.
- Consumers never supply owner state directly.
- Every public slot has one matching `SlotPropsOverrides` interface.
- `Slots` derives its keys from the canonical identity slot-name union.
- The identity tuple keeps `root` first and remaining slots in rendered DOM order.
- Every slot documents its default implementation on its `SlotsAndSlotProps` entry.
- `SlotsAndSlotProps` connects the correct default props, override interface, and owner state for each slot.
- `OwnProps` includes the slots API, classes, and component-owned props.
- `InheritedProps` uses the actual default root and excludes conflicting component-owned props.
- Component-specific contracts have semantic names and encode real constraints.
- Final `Props` composes named contracts rather than hiding them inline.
- MUI augmentation is last and registers props, class keys, overrides, and variants.
- All exported types intended for consumers are covered by the package's public API and consumer type tests.
