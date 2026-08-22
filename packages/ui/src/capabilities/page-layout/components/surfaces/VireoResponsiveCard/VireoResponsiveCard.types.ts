import type { VireoPageLayoutMode } from "@/capabilities/page-layout/types/pageLayout.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { Card, CardProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoResponsiveCardClasses, VireoResponsiveCardClassKey } from "./VireoResponsiveCard.classes";
import type { VIREO_RESPONSIVE_CARD_NAME, VireoResponsiveCardSlotName } from "./VireoResponsiveCard.identity";

export type VireoResponsiveCardOwnerState = { mode: VireoPageLayoutMode; surfaceOnCompact: boolean };
export interface VireoResponsiveCardRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoResponsiveCardSlots = { [TSlotName in VireoResponsiveCardSlotName]: React.ElementType };
export type VireoResponsiveCardSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoResponsiveCardSlots,
  {
    root: SlotProps<typeof Card, VireoResponsiveCardRootSlotPropsOverrides, VireoResponsiveCardOwnerState>;
  }
>;
export type VireoResponsiveCardOwnProps = VireoResponsiveCardSlotsAndSlotProps & {
  children: React.ReactNode;
  surfaceOnCompact?: boolean;
  classes?: Partial<VireoResponsiveCardClasses>;
};
export type VireoResponsiveCardInheritedProps = Omit<CardProps, "children" | "slots" | "slotProps">;
export type VireoResponsiveCardProps = VireoResponsiveCardOwnProps & VireoResponsiveCardInheritedProps;
declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_RESPONSIVE_CARD_NAME]?: VireoThemeComponent<
      VireoResponsiveCardProps,
      VireoResponsiveCardClassKey,
      VireoResponsiveCardOwnerState,
      Theme
    >;
  }
}
