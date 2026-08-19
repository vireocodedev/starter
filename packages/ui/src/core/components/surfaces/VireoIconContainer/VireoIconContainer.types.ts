import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { SxProps, Theme } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoIconContainerClasses, type VireoIconContainerClassKey } from "./VireoIconContainer.classes";
import type { VIREO_ICON_CONTAINER_NAME, VireoIconContainerSlotName } from "./VireoIconContainer.identity";

export type VireoIconContainerOwnerState = {
  viewBoxWidth: number;
  viewBoxHeight: number;
};

export interface VireoIconContainerRootSlotPropsOverrides {
  sx?: SxProps<Theme>;
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoIconContainer}. */
export type VireoIconContainerSlots = {
  [TSlotName in VireoIconContainerSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoIconContainer}. */
export type VireoIconContainerSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoIconContainerSlots,
  {
    /** @default 'g' */
    root: SlotProps<"g", VireoIconContainerRootSlotPropsOverrides, VireoIconContainerOwnerState>;
  }
>;

/** Props owned by {@link VireoIconContainer}. */
export type VireoIconContainerOwnProps = VireoIconContainerSlotsAndSlotProps & {
  /** Width of the coordinate system in which the child SVG geometry was authored. */
  viewBoxWidth: number;
  /** Height of the coordinate system in which the child SVG geometry was authored. */
  viewBoxHeight: number;
  /** SVG geometry proportionally scaled and centered in the standard 24×24 Vireo icon coordinate system. */
  children: React.ReactNode;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoIconContainerClasses>;
};

/** Props VireoIconContainer inherits from its default root after excluding component-owned props. */
export type VireoIconContainerInheritedProps = Omit<React.ComponentPropsWithoutRef<"g">, "children" | "transform"> & {
  sx?: SxProps<Theme>;
};

/** Props accepted by {@link VireoIconContainer}. */
export type VireoIconContainerProps = VireoIconContainerOwnProps & VireoIconContainerInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_ICON_CONTAINER_NAME]: VireoIconContainerProps;
  }

  interface ComponentNameToClassKey {
    [VIREO_ICON_CONTAINER_NAME]: VireoIconContainerClassKey;
  }

  interface Components<Theme = unknown> {
    [VIREO_ICON_CONTAINER_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_ICON_CONTAINER_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_ICON_CONTAINER_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_ICON_CONTAINER_NAME];
    };
  }
}
