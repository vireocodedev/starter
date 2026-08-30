import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { VireoApplicationNavigationMode } from "@/capabilities/application-navigation/contexts/VireoApplicationNavigationContext/VireoApplicationNavigationContext";
import type { Box, ListItemButtonProps, Typography } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoApplicationNavigationItemClasses,
  type VireoApplicationNavigationItemClassKey,
} from "./VireoApplicationNavigationItem.classes";
import type {
  VIREO_APPLICATION_NAVIGATION_ITEM_NAME,
  VireoApplicationNavigationItemSlotName,
} from "./VireoApplicationNavigationItem.identity";

export type VireoApplicationNavigationItemOwnerState = {
  mode: VireoApplicationNavigationMode;
  selected: boolean;
  disabled: boolean;
};

export interface VireoApplicationNavigationItemRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoApplicationNavigationItemIconSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoApplicationNavigationItemLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoApplicationNavigationItem}. */
export type VireoApplicationNavigationItemSlots = {
  [TSlotName in VireoApplicationNavigationItemSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoApplicationNavigationItem}. */
export type VireoApplicationNavigationItemSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoApplicationNavigationItemSlots,
  {
    /** @default ListItemButton rendered as an anchor */
    root: SlotProps<
      "a",
      VireoApplicationNavigationItemRootSlotPropsOverrides,
      VireoApplicationNavigationItemOwnerState
    >;
    /** @default 'span' */
    icon: SlotProps<
      typeof Box,
      VireoApplicationNavigationItemIconSlotPropsOverrides,
      VireoApplicationNavigationItemOwnerState
    >;
    /** @default Typography */
    label: SlotProps<
      typeof Typography,
      VireoApplicationNavigationItemLabelSlotPropsOverrides,
      VireoApplicationNavigationItemOwnerState
    >;
  }
>;

/** Props owned by {@link VireoApplicationNavigationItem}. */
export type VireoApplicationNavigationItemOwnProps = VireoApplicationNavigationItemSlotsAndSlotProps & {
  /** Destination URL rendered by the default anchor root. */
  href: string;
  /** Navigation item icon. */
  icon: React.ReactNode;
  /** Full developer-facing and accessible label. */
  label: string;
  /** Optional shorter caption used by compact mode. */
  compactLabel?: string;
  /** Overrides the surrounding navigation mode. */
  mode?: VireoApplicationNavigationMode;
  /** Tooltip shown in compact mode. Pass false to disable it. @default label */
  tooltip?: string | false;
  /** Whether the destination is active. @default false */
  selected?: boolean;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoApplicationNavigationItemClasses>;
};

/** Props VireoApplicationNavigationItem inherits from its default root after excluding component-owned props. */
export type VireoApplicationNavigationItemInheritedProps = Omit<
  ListItemButtonProps<"a">,
  "children" | "component" | "href" | "selected"
>;

/** Props accepted by {@link VireoApplicationNavigationItem}. */
export type VireoApplicationNavigationItemProps = VireoApplicationNavigationItemOwnProps &
  VireoApplicationNavigationItemInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_APPLICATION_NAVIGATION_ITEM_NAME]?: VireoThemeComponent<
      VireoApplicationNavigationItemProps,
      VireoApplicationNavigationItemClassKey,
      VireoApplicationNavigationItemOwnerState,
      Theme
    >;
  }
}
