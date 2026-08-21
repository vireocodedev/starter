import type { VireoIconName } from "@/core/providers/VireoIconRegistryProvider/VireoIconRegistryProvider";
import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { SvgIcon, SvgIconProps } from "@mui/material";
import type { VireoThemeComponent } from "@/core/utils/muiutils";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoIconClasses, type VireoIconClassKey } from "./VireoIcon.classes";
import type { VIREO_ICON_NAME, VireoIconSlotName } from "./VireoIcon.identity";

export type VireoIconOwnerState = {
  icon: VireoIconName;
};

export interface VireoIconRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoIcon}. */
export type VireoIconSlots = {
  [TSlotName in VireoIconSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoIcon}. */
export type VireoIconSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoIconSlots,
  {
    /** @default Registered icon component */
    root: SlotProps<typeof SvgIcon, VireoIconRootSlotPropsOverrides, VireoIconOwnerState>;
  }
>;

/** Props owned by {@link VireoIcon}. */
export type VireoIconOwnProps = VireoIconSlotsAndSlotProps & {
  /** Name of an icon registered through VireoIconRegistryProvider. */
  icon: VireoIconName;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoIconClasses>;
};

/** Props VireoIcon inherits from its default root after excluding component-owned props. */
export type VireoIconInheritedProps = Omit<SvgIconProps, "children" | "component">;

/** Props accepted by {@link VireoIcon}. */
export type VireoIconProps = VireoIconOwnProps & VireoIconInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_ICON_NAME]?: VireoThemeComponent<VireoIconProps, VireoIconClassKey, VireoIconOwnerState, Theme>;
  }
}
