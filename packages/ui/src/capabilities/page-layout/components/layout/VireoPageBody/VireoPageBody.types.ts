import type { VireoPageLayoutMode } from "@/capabilities/page-layout/types/pageLayout.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps, Container, ContainerProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoPageBodyClasses, VireoPageBodyClassKey } from "./VireoPageBody.classes";
import type { VIREO_PAGE_BODY_NAME, VireoPageBodySlotName } from "./VireoPageBody.identity";

export type VireoPageBodyOwnerState = { mode: VireoPageLayoutMode; paddingOnCompact: boolean };
export interface VireoPageBodyRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPageBodyContentSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPageBodyContainerSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPageBodyDrawerSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoPageBodySlots = { [TSlotName in VireoPageBodySlotName]: React.ElementType };
export type VireoPageBodySlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoPageBodySlots,
  {
    root: SlotProps<"div", VireoPageBodyRootSlotPropsOverrides, VireoPageBodyOwnerState>;
    content: SlotProps<"div", VireoPageBodyContentSlotPropsOverrides, VireoPageBodyOwnerState>;
    container: SlotProps<typeof Container, VireoPageBodyContainerSlotPropsOverrides, VireoPageBodyOwnerState>;
    drawer: SlotProps<"aside", VireoPageBodyDrawerSlotPropsOverrides, VireoPageBodyOwnerState>;
  }
>;
export type VireoPageBodyOwnProps = VireoPageBodySlotsAndSlotProps & {
  children: React.ReactNode;
  drawer?: React.ReactNode;
  maxWidth?: ContainerProps["maxWidth"];
  paddingOnCompact?: boolean;
  regularPadding?: number;
  compactPadding?: number;
  classes?: Partial<VireoPageBodyClasses>;
};
export type VireoPageBodyInheritedProps = Omit<BoxProps<"div">, "children" | "component">;
export type VireoPageBodyProps = VireoPageBodyOwnProps & VireoPageBodyInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_PAGE_BODY_NAME]?: VireoThemeComponent<
      VireoPageBodyProps,
      VireoPageBodyClassKey,
      VireoPageBodyOwnerState,
      Theme
    >;
  }
}
