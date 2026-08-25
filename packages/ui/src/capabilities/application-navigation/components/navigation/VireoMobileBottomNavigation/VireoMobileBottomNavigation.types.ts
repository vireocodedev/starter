import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BottomNavigation, BottomNavigationAction, BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoMobileBottomNavigationClasses,
  type VireoMobileBottomNavigationClassKey,
} from "./VireoMobileBottomNavigation.classes";
import type {
  VIREO_MOBILE_BOTTOM_NAVIGATION_NAME,
  VireoMobileBottomNavigationSlotName,
} from "./VireoMobileBottomNavigation.identity";

export type VireoMobileBottomNavigationItem = {
  /** Stable opaque value reported when the destination is selected. */
  value: string;
  /** Visible destination label. */
  label: string;
  /** Decorative destination icon. */
  icon: React.ReactNode;
  /** Optional accessible name when it must differ from the visible label. */
  ariaLabel?: string;
  /** Whether the destination is unavailable. @default false */
  disabled?: boolean;
};

export type VireoMobileBottomNavigationOwnerState = {
  itemCount: number;
  safeAreaInset: boolean;
  selected: boolean;
};

export interface VireoMobileBottomNavigationRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoMobileBottomNavigationNavigationSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoMobileBottomNavigationActionSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoMobileBottomNavigation}. */
export type VireoMobileBottomNavigationSlots = {
  [TSlotName in VireoMobileBottomNavigationSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoMobileBottomNavigation}. */
export type VireoMobileBottomNavigationSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoMobileBottomNavigationSlots,
  {
    /** @default 'nav' */
    root: SlotProps<"nav", VireoMobileBottomNavigationRootSlotPropsOverrides, VireoMobileBottomNavigationOwnerState>;
    /** @default BottomNavigation */
    navigation: SlotProps<
      typeof BottomNavigation,
      VireoMobileBottomNavigationNavigationSlotPropsOverrides,
      VireoMobileBottomNavigationOwnerState
    >;
    /** @default BottomNavigationAction */
    action: SlotProps<
      typeof BottomNavigationAction,
      VireoMobileBottomNavigationActionSlotPropsOverrides,
      VireoMobileBottomNavigationOwnerState
    >;
  }
>;

/** Props owned by {@link VireoMobileBottomNavigation}. */
export type VireoMobileBottomNavigationOwnProps = VireoMobileBottomNavigationSlotsAndSlotProps & {
  /** Destinations rendered in their supplied order. Three to five concise destinations are recommended. */
  items: readonly VireoMobileBottomNavigationItem[];
  /** Selected opaque destination value, or false when the current location has no quick-navigation destination. @default false */
  value?: string | false;
  /** Called after a destination is selected. */
  onChange?: (value: string, event: React.SyntheticEvent) => void;
  /** Adds the device bottom safe-area inset below the navigation actions. @default true */
  safeAreaInset?: boolean;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoMobileBottomNavigationClasses>;
};

/** Props VireoMobileBottomNavigation inherits from its default root after excluding component-owned props. */
export type VireoMobileBottomNavigationInheritedProps = Omit<BoxProps<"nav">, "children" | "component" | "onChange">;

/** Props accepted by {@link VireoMobileBottomNavigation}. */
export type VireoMobileBottomNavigationProps = VireoMobileBottomNavigationOwnProps &
  VireoMobileBottomNavigationInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_MOBILE_BOTTOM_NAVIGATION_NAME]?: VireoThemeComponent<
      VireoMobileBottomNavigationProps,
      VireoMobileBottomNavigationClassKey,
      VireoMobileBottomNavigationOwnerState,
      Theme
    >;
  }
}
