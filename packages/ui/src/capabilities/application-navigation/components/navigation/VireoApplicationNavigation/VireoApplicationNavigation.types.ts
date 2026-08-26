import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { VireoApplicationNavigationMode } from "@/capabilities/application-navigation/contexts/VireoApplicationNavigationContext/VireoApplicationNavigationContext";
import type { VireoSidePanelResizeHandle } from "@/capabilities/overlays/public";
import type { Box, BoxProps, Drawer } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoApplicationNavigationClasses,
  type VireoApplicationNavigationClassKey,
} from "./VireoApplicationNavigation.classes";
import type {
  VIREO_APPLICATION_NAVIGATION_NAME,
  VireoApplicationNavigationSlotName,
} from "./VireoApplicationNavigation.identity";

export type { VireoApplicationNavigationMode } from "@/capabilities/application-navigation/contexts/VireoApplicationNavigationContext/VireoApplicationNavigationContext";

export const VIREO_APPLICATION_NAVIGATION_WIDTH_CSS_VAR = "--vireo-application-navigation-width";
export const VIREO_APPLICATION_NAVIGATION_DEFAULT_EXPANDED_WIDTH = 264;
export const VIREO_APPLICATION_NAVIGATION_DEFAULT_COMPACT_WIDTH = 80;
export const VIREO_APPLICATION_NAVIGATION_MIN_EXPANDED_WIDTH = 220;
export const VIREO_APPLICATION_NAVIGATION_MAX_EXPANDED_WIDTH = 480;
export const VIREO_APPLICATION_NAVIGATION_DEFAULT_COLLAPSE_THRESHOLD = VIREO_APPLICATION_NAVIGATION_MIN_EXPANDED_WIDTH;

export type VireoApplicationNavigationVariant = "permanent" | "temporary";

export type VireoApplicationNavigationRenderState = {
  mode: VireoApplicationNavigationMode;
  width: number;
  isResizing: boolean;
  toggleMode: () => void;
};

export type VireoApplicationNavigationOwnerState = {
  mode: VireoApplicationNavigationMode;
  variant: VireoApplicationNavigationVariant;
  width: number;
  isResizing: boolean;
  resizable: boolean;
  locked: boolean;
};

export interface VireoApplicationNavigationRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoApplicationNavigationSurfaceSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoApplicationNavigationContentSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoApplicationNavigationResizeHandleSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoApplicationNavigation}. */
export type VireoApplicationNavigationSlots = {
  [TSlotName in VireoApplicationNavigationSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoApplicationNavigation}. */
export type VireoApplicationNavigationSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoApplicationNavigationSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoApplicationNavigationRootSlotPropsOverrides, VireoApplicationNavigationOwnerState>;
    /** @default Drawer */
    surface: SlotProps<
      typeof Drawer,
      VireoApplicationNavigationSurfaceSlotPropsOverrides,
      VireoApplicationNavigationOwnerState
    >;
    /** @default 'div' */
    content: SlotProps<
      typeof Box,
      VireoApplicationNavigationContentSlotPropsOverrides,
      VireoApplicationNavigationOwnerState
    >;
    /** @default VireoSidePanelResizeHandle */
    resizeHandle: SlotProps<
      typeof VireoSidePanelResizeHandle,
      VireoApplicationNavigationResizeHandleSlotPropsOverrides,
      VireoApplicationNavigationOwnerState
    >;
  }
>;

/** Props owned by {@link VireoApplicationNavigation}. */
export type VireoApplicationNavigationOwnProps = VireoApplicationNavigationSlotsAndSlotProps & {
  /** Current desktop navigation presentation. @default 'expanded' */
  mode?: VireoApplicationNavigationMode;
  /** Desktop or modal navigation surface. @default 'permanent' */
  variant?: VireoApplicationNavigationVariant;
  /** Whether a temporary surface is open. Ignored by permanent surfaces. @default false */
  open?: boolean;
  /** Requests that a temporary surface close. */
  onClose?: () => void;
  /** Remembered width used by expanded mode. @default 264 */
  expandedWidth?: number;
  /** Fixed width used by compact mode. @default 80 */
  compactWidth?: number;
  /** Smallest expanded width. @default 220 */
  minExpandedWidth?: number;
  /** Largest expanded width. @default 480 */
  maxExpandedWidth?: number;
  /** Expanded width restored by a resize-handle double click. @default 264 */
  defaultExpandedWidth?: number;
  /** Width below which resizing snaps to compact mode. @default minExpandedWidth */
  collapseThreshold?: number;
  /** Enables pointer and keyboard resizing for a permanent surface. @default true */
  resizable?: boolean;
  /** Locks the current mode and width by disabling mode toggles and resizing. @default false */
  locked?: boolean;
  /** Called when the requested desktop mode changes. */
  onModeChange?: (mode: VireoApplicationNavigationMode) => void;
  /** Called when resizing or a reset commits a new expanded width. */
  onExpandedWidthChange?: (width: number) => void;
  /** Navigation contents, optionally rendered from the resolved navigation state. */
  children: React.ReactNode | ((state: VireoApplicationNavigationRenderState) => React.ReactNode);
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoApplicationNavigationClasses>;
};

/** Props VireoApplicationNavigation inherits from its default root after excluding component-owned props. */
export type VireoApplicationNavigationInheritedProps = Omit<BoxProps<"div">, "children" | "component">;

/** Props accepted by {@link VireoApplicationNavigation}. */
export type VireoApplicationNavigationProps = VireoApplicationNavigationOwnProps &
  VireoApplicationNavigationInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_APPLICATION_NAVIGATION_NAME]?: VireoThemeComponent<
      VireoApplicationNavigationProps,
      VireoApplicationNavigationClassKey,
      VireoApplicationNavigationOwnerState,
      Theme
    >;
  }
}
