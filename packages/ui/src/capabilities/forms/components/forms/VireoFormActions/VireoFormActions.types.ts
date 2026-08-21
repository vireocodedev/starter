import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { Box, BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoFormActionsClasses, type VireoFormActionsClassKey } from "./VireoFormActions.classes";
import type { VIREO_FORM_ACTIONS_NAME, VireoFormActionsSlotName } from "./VireoFormActions.identity";

export type VireoFormActionsOwnerState = Record<never, never>;

export interface VireoFormActionsRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormActionsLayoutSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoFormActions}. */
export type VireoFormActionsSlots = {
  [TSlotName in VireoFormActionsSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoFormActions}. */
export type VireoFormActionsSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormActionsSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoFormActionsRootSlotPropsOverrides, VireoFormActionsOwnerState>;
    /** @default Box */
    layout: SlotProps<typeof Box, VireoFormActionsLayoutSlotPropsOverrides, VireoFormActionsOwnerState>;
  }
>;

/** Props owned by {@link VireoFormActions}. */
export type VireoFormActionsOwnProps = VireoFormActionsSlotsAndSlotProps & {
  children: React.ReactNode;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoFormActionsClasses>;
};

/** Props VireoFormActions inherits from its default root after excluding component-owned props. */
export type VireoFormActionsInheritedProps = Omit<BoxProps<"div">, "children" | "component">;

/** Props accepted by {@link VireoFormActions}. */
export type VireoFormActionsProps = VireoFormActionsOwnProps & VireoFormActionsInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_ACTIONS_NAME]?: VireoThemeComponent<
      VireoFormActionsProps,
      VireoFormActionsClassKey,
      VireoFormActionsOwnerState,
      Theme
    >;
  }
}
