import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { ResponsiveOverlayFrameDesktopSidePanelWidth } from "@/capabilities/overlays/types/overlay.types";
import type { BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoDockedSidePanelClasses, type VireoDockedSidePanelClassKey } from "./VireoDockedSidePanel.classes";
import type { VIREO_DOCKED_SIDE_PANEL_NAME, VireoDockedSidePanelSlotName } from "./VireoDockedSidePanel.identity";

export type VireoDockedSidePanelOwnerState = {
  open: boolean;
  width: ResponsiveOverlayFrameDesktopSidePanelWidth;
  minWidth: number;
  maxWidth: number;
  isResizing: boolean;
  isPanelPresent: boolean;
  isPanelEntered: boolean;
};

export interface VireoDockedSidePanelRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoDockedSidePanelSurfaceSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoDockedSidePanel}. */
export type VireoDockedSidePanelSlots = {
  [TSlotName in VireoDockedSidePanelSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoDockedSidePanel}. */
export type VireoDockedSidePanelSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoDockedSidePanelSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoDockedSidePanelRootSlotPropsOverrides, VireoDockedSidePanelOwnerState>;
    /** @default 'aside' */
    surface: SlotProps<"aside", VireoDockedSidePanelSurfaceSlotPropsOverrides, VireoDockedSidePanelOwnerState>;
  }
>;

/** Props owned by {@link VireoDockedSidePanel}. */
export type VireoDockedSidePanelOwnProps = VireoDockedSidePanelSlotsAndSlotProps & {
  /** Whether the panel is entered and interactive. */
  open: boolean;
  /** Width reserved for the visible panel surface. */
  width: ResponsiveOverlayFrameDesktopSidePanelWidth;
  /** Minimum visible panel width in pixels. */
  minWidth: number;
  /** Maximum visible panel width in pixels. */
  maxWidth: number;
  /** Disables surface transitions while pointer resizing is active. @default false */
  isResizing?: boolean;
  /** Optional resize control rendered before panel content. */
  resizeHandle?: React.ReactNode;
  /** Called once after the panel finishes leaving. */
  onExited?: () => void;
  /** Panel contents. */
  children: React.ReactNode;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoDockedSidePanelClasses>;
};

/** Props VireoDockedSidePanel inherits from its default root after excluding component-owned props. */
export type VireoDockedSidePanelInheritedProps = Omit<BoxProps<"div">, "children" | "component" | "ref">;

/** Props accepted by {@link VireoDockedSidePanel}. */
export type VireoDockedSidePanelProps = VireoDockedSidePanelOwnProps & VireoDockedSidePanelInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_DOCKED_SIDE_PANEL_NAME]?: VireoThemeComponent<
      VireoDockedSidePanelProps,
      VireoDockedSidePanelClassKey,
      VireoDockedSidePanelOwnerState,
      Theme
    >;
  }
}
