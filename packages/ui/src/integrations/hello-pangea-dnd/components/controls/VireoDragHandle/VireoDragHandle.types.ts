import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type DragIndicatorRounded from "@mui/icons-material/DragIndicatorRounded";
import type { IconButton, IconButtonProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoDragHandleClasses, type VireoDragHandleClassKey } from "./VireoDragHandle.classes";
import type { VIREO_DRAG_HANDLE_NAME, VireoDragHandleSlotName } from "./VireoDragHandle.identity";

export type VireoDragHandleOwnerState = {
  disabled: boolean;
  isDragging: boolean;
};

export interface VireoDragHandleRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoDragHandleIconSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoDragHandle}. */
export type VireoDragHandleSlots = {
  [TSlotName in VireoDragHandleSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoDragHandle}. */
export type VireoDragHandleSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoDragHandleSlots,
  {
    /** @default IconButton */
    root: SlotProps<typeof IconButton, VireoDragHandleRootSlotPropsOverrides, VireoDragHandleOwnerState>;
    /** @default DragIndicatorRounded */
    icon: SlotProps<typeof DragIndicatorRounded, VireoDragHandleIconSlotPropsOverrides, VireoDragHandleOwnerState>;
  }
>;

/** Props owned by {@link VireoDragHandle}. */
export type VireoDragHandleOwnProps = VireoDragHandleSlotsAndSlotProps & {
  children?: React.ReactNode;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoDragHandleClasses>;
};

export type VireoDragHandleAccessibleName =
  { "aria-label": string; "aria-labelledby"?: string } | { "aria-label"?: string; "aria-labelledby": string };

/** Props VireoDragHandle inherits from its default root after excluding component-owned props. */
export type VireoDragHandleInheritedProps = Omit<
  IconButtonProps,
  "aria-label" | "aria-labelledby" | "children" | "component" | "disabled"
>;

/** Props accepted by {@link VireoDragHandle}. */
export type VireoDragHandleProps = VireoDragHandleOwnProps &
  VireoDragHandleAccessibleName &
  VireoDragHandleInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_DRAG_HANDLE_NAME]?: VireoThemeComponent<
      VireoDragHandleProps,
      VireoDragHandleClassKey,
      VireoDragHandleOwnerState,
      Theme
    >;
  }
}
