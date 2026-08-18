# Vireo component implementation files

Every first-class public Vireo MUI component keeps its rendering and behavior in a colocated `VireoComponent.tsx` file. This module connects the component's public contracts, canonical identity, utility classes, styled slots, MUI theme integration, slot customization, refs, events, accessibility, and final JSX composition.

[`VireoOverlayHeader.tsx`](../../src/overlay/VireoOverlayHeader/VireoOverlayHeader.tsx) is the reference implementation.

## Module shape

Order a component implementation as follows:

1. Module imports
2. Private `useUtilityClasses`
3. Component JSDoc and `forwardRef` declaration
4. Theme-prop resolution
5. Prop normalization
6. Optional pre-owner-state values and hooks
7. Normalized owner state
8. Utility-class resolution
9. Slot-prop resolution
10. Slot-prop extraction and ref composition
11. Optional derived values
12. Optional composed event handlers
13. Slot rendering and prop precedence
14. Component `displayName`

The optional sections exist only when component behavior requires them. Preserve dependency order rather than creating empty sections.

## Imports

Import contracts from their owning modules:

- The component name and slot-name type from `VireoComponent.identity.ts`.
- The utility-class generator and class-key type from `VireoComponent.classes.ts`.
- Owner state and public props from `VireoComponent.types.ts`.
- Styled slot implementations from `VireoComponent.styled.ts`.
- Shared component-authoring helpers from `muiutils`.
- `useThemeProps` and `useForkRef` from MUI.

Do not redeclare component identity, public slot names, class keys, owner state, or styled slots in the implementation file.

## Render-time utility classes

Every Vireo component defines a private `useUtilityClasses` before the component declaration:

```ts
function useUtilityClasses(_ownerState: VireoComponentOwnerState, classes?: VireoComponentProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
    } as const satisfies UtilityClassSlotMap<VireoComponentSlotName, VireoComponentClassKey>,
    getVireoComponentUtilityClass,
    classes,
  );
}
```

The map must contain every canonical public slot. Its values may contain only valid class keys and the false-like values supported by MUI's `composeClasses`.

Accept owner state even when the initial component has no conditional classes. Name the parameter `_ownerState` while it is unused. Remove the underscore once class application depends on it:

```ts
root: ["root", ownerState.disabled && "disabled"];
```

Keep this function private in `VireoComponent.tsx`. The classes file owns static class contracts and generation; this function owns per-render class selection.

## Component declaration

Document the component's purpose and expose it as a named `forwardRef` component:

```ts
/**
 * Renders the standard structure for a Vireo component.
 */
export const VireoComponent = React.forwardRef<HTMLElement, VireoComponentProps>(
  function VireoComponent(inProps, forwardedRef) {
    // implementation
  },
);
```

Every first-class Vireo component forwards its root ref. Choose the ref element type from the semantic default root: for example, `HTMLElement` for a `header` or `HTMLButtonElement` for a button.

Use a named render function so stack traces and debugging remain useful before `displayName` is assigned. Do not use a default export.

## Theme-prop resolution

Resolve MUI theme defaults before reading any props:

```ts
const props = useThemeProps({
  props: inProps,
  name: VIREO_COMPONENT_NAME,
});
```

Always use the canonical identity constant. Reading directly from `inProps` would bypass `theme.components.VireoComponent.defaultProps`.

## Prop normalization

Destructure the resolved `props`, apply public defaults, and preserve inherited root props:

```ts
const { className, classes: classesProp, slotProps = {}, slots = {}, disabled = false, style, sx, ...other } = props;
```

Use `classesProp` for the destructured public `classes` value so the locally resolved `classes` object has the clear canonical name.

Apply defaults here when they normalize public props into required owner-state values. Do not scatter fallback logic across rendering.

`other` contains only supported inherited root props because `VireoComponentInheritedProps` already removes component-owned conflicts.

## Pre-owner-state values and hooks

Create values before owner state only when owner-state construction depends on them:

```ts
const generatedId = React.useId();
```

Hooks must remain unconditional and follow React's rules. Do not create an empty section when the component has no prerequisite values.

## Normalized owner state

Every component constructs one complete owner-state object after public defaults are resolved:

```ts
const ownerState: VireoComponentOwnerState = {
  disabled,
  hasLabel: label !== undefined && label !== null,
};
```

Use normalized values and derived rendering facts. Pass the same object to utility-class composition, every slot-prop callback, and every styled slot.

Do not add values that rendering, styling, utility classes, variants, or slot customization cannot observe.

## Utility-class resolution

Resolve classes immediately after owner state:

```ts
const classes = useUtilityClasses(ownerState, classesProp);
```

The result contains the stable generated class and any consumer-provided class for each rendered slot.

## Slot-prop resolution

Resolve every public slot in canonical identity-tuple and DOM order:

```ts
const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
const resolvedLabelSlotProps = resolveSlotProps(slotProps.label, ownerState);
```

`resolveSlotProps` accepts both object and owner-state callback forms and returns a partial prop object. Because `VireoComponent.types.ts` uses concrete default component types such as `typeof Typography`, TypeScript should infer each result without local annotations or assertions.

Do not add `as ResolvedSlotProps` assertions to silence broad inference. Fix the corresponding `SlotProps` default component type instead. Add a local annotation only when it represents a real additional invariant that inference cannot express.

## Slot-prop extraction

Extract only props that require merging, precedence, ref composition, event composition, or internal derivation. Preserve everything else for pass-through:

```ts
const {
  className: rootSlotClassName,
  ref: rootSlotRef,
  style: rootSlotStyle,
  sx: rootSlotSx,
  ...rootSlotOther
} = resolvedRootSlotProps;
```

For another slot:

```ts
const {
  className: actionSlotClassName,
  disabled: actionSlotDisabled,
  onClick: actionSlotOnClick,
  ...actionSlotOther
} = resolvedActionSlotProps;
```

Do not destructure ordinary pass-through props individually.

## Root ref composition

Every component combines the public forwarded ref with `slotProps.root.ref` using MUI's `useForkRef`:

```ts
const rootRef = useForkRef(forwardedRef, rootSlotRef);
```

Do not hand-write a callback ref or maintain a Vireo-specific ref assignment helper. `useForkRef` handles callback refs, object refs, memoization, and cleanup consistently with MUI.

If the implementation also owns an internal root ref, include it in the same call.

## Derived values

Calculate final IDs, disabled states, and other merged behavior after relevant slot props have been extracted:

```ts
const resolvedLabelId = labelId ?? labelSlotId ?? generatedLabelId;
const effectiveDisabled = disabled || actionSlotDisabled === true;
```

Make precedence explicit and give the result a semantic name. Omit this section when the component has no derived values.

## Event composition

When a slot handler and component-owned handler both apply, call the slot handler first and allow it to cancel component behavior:

```ts
const handleClick = React.useCallback<NonNullable<ButtonProps["onClick"]>>(
  event => {
    actionSlotOnClick?.(event);

    if (!event.defaultPrevented) {
      onClick?.(event);
    }
  },
  [actionSlotOnClick, onClick],
);
```

Use the underlying MUI or native handler type rather than restating the event type manually. Hooks remain unconditional even when the corresponding slot is rendered conditionally.

Not every handler is cancelable. Use `defaultPrevented` when preventing the component-owned follow-up behavior is an intentional part of the slot contract.

## Slot rendering

Render the root and remaining slots in canonical DOM order. Every styled slot receives the same owner state and its composed utility class:

```tsx
return (
  <VireoComponentRoot
    {...other}
    {...rootSlotOther}
    as={slots.root ?? "div"}
    ref={rootRef}
    ownerState={ownerState}
    className={joinClassNames(classes.root, className, rootSlotClassName)}
    style={{ ...style, ...rootSlotStyle }}
    sx={mergeSx(sx, rootSlotSx)}
  >
    {ownerState.hasLabel && (
      <VireoComponentLabel
        {...labelSlotOther}
        as={slots.label}
        ownerState={ownerState}
        className={joinClassNames(classes.label, labelSlotClassName)}
      >
        {label}
      </VireoComponentLabel>
    )}
  </VireoComponentRoot>
);
```

Use `as` only to select the canonical default root or a public replacement supplied through `slots`. The default root must preserve the component's intended native semantics.

## Prop precedence

Prop order is part of the public behavior. Apply root props in this sequence:

1. Inherited top-level root props (`...other`)
2. Resolved root slot props (`...rootSlotOther`)
3. Component-controlled replacement, ref, owner state, merged classes, `style`, and `sx`

This gives focused `slotProps.root` precedence over equivalent inherited top-level props while preserving component-owned invariants and explicit merging.

For non-root slots:

1. Internal defaults
2. Resolved pass-through slot props
3. Component-controlled replacement, IDs, owner state, merged classes, accessibility, disabled state, and composed handlers

Extract consumer values before spreading when they must participate in a merge. Never permit a late spread to overwrite required accessibility attributes or internal event composition accidentally.

## Accessibility ownership

The component owns accessibility requirements intrinsic to its behavior. Apply required labels, IDs, relationships, disabled state, `aria-hidden`, and focusability after pass-through slot props when consumers must not invalidate them.

Public types should encode accessibility dependencies where possible, such as requiring an accessible close label whenever an `onClose` callback is supplied. Runtime composition must preserve those guarantees.

## Display name

Assign the canonical identity immediately after the component declaration:

```ts
VireoComponent.displayName = VIREO_COMPONENT_NAME;
```

This keeps React DevTools, stack traces, and debugging consistent with MUI theme and utility-class identity.

## What does not belong here

Keep these concerns in their dedicated modules:

- Public props, slots, owner state, and theme augmentation: `VireoComponent.types.ts`
- Utility-class contracts and generators: `VireoComponent.classes.ts`
- Canonical name and public slot tuple: `VireoComponent.identity.ts`
- Styled slot definitions and default CSS: `VireoComponent.styled.ts`
- Tests and interaction assertions: `VireoComponent.test.tsx`
- Storybook documentation and visual examples: `VireoComponent.stories.tsx`

The implementation file coordinates those contracts; it does not redefine them.

## Review checklist

- The file is named `VireoComponent.tsx`.
- It defines a private, slot-complete `useUtilityClasses`.
- The component has purpose-focused JSDoc and a named `forwardRef` render function.
- `useThemeProps` is called before props are read.
- Public defaults are normalized during prop destructuring.
- One complete owner-state object is created and shared everywhere.
- Utility classes are resolved immediately after owner state.
- Every public slot prop is resolved in canonical order.
- Slot resolution uses inference without type assertions.
- Only props requiring composition or precedence are extracted.
- The forwarded and root-slot refs are combined with `useForkRef`.
- Optional derived values and handlers follow dependency order.
- Slot handlers are composed without losing intentional cancellation behavior.
- Slots render in canonical DOM order with explicit prop precedence.
- Required accessibility behavior cannot be overwritten accidentally.
- Styled slots receive owner state and composed utility classes.
- The component has no inline default styling that belongs in `*.styled.ts`.
- `displayName` uses the canonical component name.
- The file exports no private implementation helper.
