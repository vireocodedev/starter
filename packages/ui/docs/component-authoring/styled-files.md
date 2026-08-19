# Vireo styled files

Every public Vireo component that participates in MUI theme customization keeps its named styled slots in a colocated `VireoComponent.styled.ts` file. This file is styling infrastructure: it defines the component's default styled slot implementations but contains no rendering behavior.

## Required shape

After imports, a styled file is ordered as follows:

1. A private component-bound `VireoComponentStyledSlotProps` alias.
2. A private component-bound `VireoComponentStyledSlotComponent` alias.
3. The exported `VireoComponentRoot` styled slot.
4. Other exported styled slots in rendered DOM order.

Use the singular name `StyledSlotComponent`: the generic describes the type of one styled component.

```ts
import { type VireoComponentOwnerState } from "./VireoComponent.types";
import { VIREO_COMPONENT_NAME } from "./VireoComponent.identity";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";

type VireoComponentStyledSlotProps = StyledSlotProps<VireoComponentOwnerState>;
type VireoComponentStyledSlotComponent<TProps extends object> = StyledSlotComponent<TProps, VireoComponentOwnerState>;

export const VireoComponentRoot: VireoComponentStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_COMPONENT_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoComponentStyledSlotProps>({});
```

The explicit `VireoComponentStyledSlotComponent` annotation prevents emitted declarations from referring to non-portable nested MUI package paths. The `VireoComponentStyledSlotProps` generic gives every styling callback the correctly typed owner state.

## Root slot rule

Every Vireo component has a `Root` slot. New styled files scaffold that slot with MUI `Box` and `BoxProps` because `Box` is a neutral structural default.

The scaffold cannot infer the root's semantics from the component name. Before completing a component, decide whether its root must instead be interactive or specialized. If it changes, replace the component and its props type together:

```ts
import { ButtonBase, type ButtonBaseProps } from "@mui/material";

export const VireoActionRoot: VireoActionStyledSlotComponent<ButtonBaseProps> = styled(ButtonBase, {
  name: VIREO_ACTION_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoActionStyledSlotProps>({});
```

Do not use a neutral `Box` for something that has native button, link, input, or other interactive semantics.

## Adding slots

Add a styled slot only when it has baseline styling or is intentionally exposed through MUI `styleOverrides`. Name it from its public slot and class key, and place it in rendered DOM order after `Root`:

```ts
export const VireoComponentLabel: VireoComponentStyledSlotComponent<TypographyProps> = styled(Typography, {
  name: VIREO_COMPONENT_NAME,
  slot: "Label",
  overridesResolver: (_props, styles) => styles.label,
})<VireoComponentStyledSlotProps>(({ theme, ownerState }) => ({
  color: ownerState.disabled ? theme.palette.text.disabled : theme.palette.text.primary,
}));
```

Component state that influences styling belongs in `ownerState`. Props belonging to the underlying slot remain in its MUI props type.

Public styled slots must correspond to entries in the canonical slot tuple from `VireoComponent.identity.ts`. Adding a slot to that tuple still requires implementation review because TypeScript cannot prove by name alone that a matching styled component exists or is rendered.

## Theme integration

The imported identity constant must be the component's canonical name from its colocated `VireoComponent.identity.ts` file. See [Vireo identity files](./identity-files.md).

Use that constant in:

- `useThemeProps` in the component implementation.
- `ComponentsPropsList` theme augmentation.
- `ComponentNameToClassKey` theme augmentation.
- `Components` theme augmentation.
- Utility-class generation.

Every styled slot uses the same identity constant, its own PascalCase MUI `slot`, and an `overridesResolver` for the matching camelCase class key.

## What does not belong here

Keep these concerns in `VireoComponent.tsx` or its other colocated modules:

- JSX composition and conditional rendering.
- Event handlers and behavior.
- Slot-prop resolution and prop merging.
- Ref orchestration.
- Public props, slot, and owner-state declarations.
- Utility-class declarations.

Styled slot components are internal implementation modules. Export them to the main component file, but do not add them to the package's public barrel.

## Review checklist

- The file is named `VireoComponent.styled.ts`.
- The component identity is imported from `VireoComponent.identity.ts`.
- The local aliases bind the shared generics to the component's owner state.
- `Root` is the first exported styled slot.
- The root component has the correct semantics and matching props type.
- Remaining public styled slots correspond to the identity tuple and follow rendered DOM order.
- Every slot has `name`, `slot`, and `overridesResolver` configuration.
- Styling conditions use `ownerState`; theme values use `theme`.
- The file contains no component behavior.
- Styled slots are not publicly barrel-exported.
