import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { BoxProps } from "@mui/material";
import type { VireoThemeComponent } from "@/core/utils/muiutils";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoStatusDotClasses, type VireoStatusDotClassKey } from "./VireoStatusDot.classes";
import type { VIREO_STATUS_DOT_NAME, VireoStatusDotSlotName } from "./VireoStatusDot.identity";

export type VireoStatusDotColor = "success" | "error" | "warning" | "info" | "standard";

export type VireoStatusDotSize = number | string;

export type VireoStatusDotOwnerState = {
  color: VireoStatusDotColor;
  labeled: boolean;
  selected: boolean;
  size: VireoStatusDotSize;
};

export interface VireoStatusDotRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoStatusDot}. */
export type VireoStatusDotSlots = {
  [TSlotName in VireoStatusDotSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoStatusDot}. */
export type VireoStatusDotSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoStatusDotSlots,
  {
    /** @default 'span' */
    root: SlotProps<"span", VireoStatusDotRootSlotPropsOverrides, VireoStatusDotOwnerState>;
  }
>;

/** Props owned by {@link VireoStatusDot}. */
export type VireoStatusDotOwnProps = VireoStatusDotSlotsAndSlotProps & {
  /** Semantic color represented by the dot. */
  color: VireoStatusDotColor;
  /** Accessible label for a standalone dot. Omit when adjacent text already conveys its meaning. */
  label?: string;
  /** Inverts the dot for selected or emphasized surfaces. @default false */
  selected?: boolean;
  /** Diameter of the dot. Numbers are interpreted as pixels. @default 8 */
  size?: VireoStatusDotSize;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoStatusDotClasses>;
};

/** Props VireoStatusDot inherits from its default root after excluding component-owned props. */
export type VireoStatusDotInheritedProps = Omit<
  BoxProps<"span">,
  "aria-hidden" | "aria-label" | "children" | "color" | "component" | "role"
>;

/** Props accepted by {@link VireoStatusDot}. */
export type VireoStatusDotProps = VireoStatusDotOwnProps & VireoStatusDotInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_STATUS_DOT_NAME]?: VireoThemeComponent<
      VireoStatusDotProps,
      VireoStatusDotClassKey,
      VireoStatusDotOwnerState,
      Theme
    >;
  }
}
