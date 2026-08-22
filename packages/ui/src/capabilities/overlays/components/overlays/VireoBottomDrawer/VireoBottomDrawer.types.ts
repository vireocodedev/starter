import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { Box, SwipeableDrawer, SwipeableDrawerProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoBottomDrawerClasses, type VireoBottomDrawerClassKey } from "./VireoBottomDrawer.classes";
import type { VIREO_BOTTOM_DRAWER_NAME, VireoBottomDrawerSlotName } from "./VireoBottomDrawer.identity";

export type VireoBottomDrawerOwnerState = {
  open: boolean;
  hasFixedHeight: boolean;
  keepMounted: boolean;
  useBackdrop: boolean;
};

export interface VireoBottomDrawerRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoBottomDrawerPullerSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoBottomDrawer}. */
export type VireoBottomDrawerSlots = {
  [TSlotName in VireoBottomDrawerSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoBottomDrawer}. */
export type VireoBottomDrawerSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoBottomDrawerSlots,
  {
    /** @default SwipeableDrawer */
    root: SlotProps<typeof SwipeableDrawer, VireoBottomDrawerRootSlotPropsOverrides, VireoBottomDrawerOwnerState>;
    /** @default Box */
    puller: SlotProps<typeof Box, VireoBottomDrawerPullerSlotPropsOverrides, VireoBottomDrawerOwnerState>;
  }
>;

/** Props owned by {@link VireoBottomDrawer}. */
export type VireoBottomDrawerOwnProps = VireoBottomDrawerSlotsAndSlotProps & {
  open: boolean;
  onClose: () => void;
  onExited?: () => void;
  onOpen?: () => void;
  children: React.ReactNode;
  /** Fixed drawer height. Prefer this or maxHeight, not both. */
  height?: string;
  /** Maximum height for a content-sized drawer. */
  maxHeight?: string;
  keepMounted?: boolean;
  /** Whether the modal backdrop is visible. @default true */
  useBackdrop?: boolean;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoBottomDrawerClasses>;
};

/** Props VireoBottomDrawer inherits from its default root after excluding component-owned props. */
export type VireoBottomDrawerInheritedProps = Omit<
  SwipeableDrawerProps,
  | "anchor"
  | "children"
  | "disableBackdropTransition"
  | "disableDiscovery"
  | "disableSwipeToOpen"
  | "hideBackdrop"
  | "keepMounted"
  | "onClose"
  | "onOpen"
  | "open"
  | "slotProps"
>;

/** Props accepted by {@link VireoBottomDrawer}. */
export type VireoBottomDrawerProps = VireoBottomDrawerOwnProps & VireoBottomDrawerInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_BOTTOM_DRAWER_NAME]?: VireoThemeComponent<
      VireoBottomDrawerProps,
      VireoBottomDrawerClassKey,
      VireoBottomDrawerOwnerState,
      Theme
    >;
  }
}
