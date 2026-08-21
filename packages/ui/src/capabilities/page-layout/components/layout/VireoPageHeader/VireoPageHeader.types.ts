import type { VireoPageLayoutMode } from "@/capabilities/page-layout/types/pageLayout.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps, Typography } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoPageHeaderClasses, VireoPageHeaderClassKey } from "./VireoPageHeader.classes";
import type { VIREO_PAGE_HEADER_NAME, VireoPageHeaderSlotName } from "./VireoPageHeader.identity";

export type VireoPageHeaderOwnerState = { mode: VireoPageLayoutMode; hasLeading: boolean; hasActions: boolean };
export interface VireoPageHeaderRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPageHeaderLeadingSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPageHeaderTitleSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPageHeaderActionsSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoPageHeaderSlots = { [TSlotName in VireoPageHeaderSlotName]: React.ElementType };
export type VireoPageHeaderSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoPageHeaderSlots,
  {
    root: SlotProps<"header", VireoPageHeaderRootSlotPropsOverrides, VireoPageHeaderOwnerState>;
    leading: SlotProps<"div", VireoPageHeaderLeadingSlotPropsOverrides, VireoPageHeaderOwnerState>;
    title: SlotProps<typeof Typography, VireoPageHeaderTitleSlotPropsOverrides, VireoPageHeaderOwnerState>;
    actions: SlotProps<"div", VireoPageHeaderActionsSlotPropsOverrides, VireoPageHeaderOwnerState>;
  }
>;
export type VireoPageHeaderOwnProps = VireoPageHeaderSlotsAndSlotProps & {
  title?: React.ReactNode;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  classes?: Partial<VireoPageHeaderClasses>;
};
export type VireoPageHeaderInheritedProps = Omit<BoxProps<"header">, "children" | "component" | "title">;
export type VireoPageHeaderProps = VireoPageHeaderOwnProps & VireoPageHeaderInheritedProps;
declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_PAGE_HEADER_NAME]?: VireoThemeComponent<
      VireoPageHeaderProps,
      VireoPageHeaderClassKey,
      VireoPageHeaderOwnerState,
      Theme
    >;
  }
}
