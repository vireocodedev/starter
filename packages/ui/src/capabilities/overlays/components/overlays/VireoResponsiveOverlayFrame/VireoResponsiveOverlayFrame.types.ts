import type {
  ResponsiveOverlayFrameDesktopSidePanelWidth,
  ResponsiveOverlayFrameDesktopSurface,
} from "@/capabilities/overlays/types/overlay.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps, DialogProps, SxProps, Theme } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoResponsiveOverlayFrameClasses,
  type VireoResponsiveOverlayFrameClassKey,
} from "./VireoResponsiveOverlayFrame.classes";
import type {
  VIREO_RESPONSIVE_OVERLAY_FRAME_NAME,
  VireoResponsiveOverlayFrameSlotName,
} from "./VireoResponsiveOverlayFrame.identity";

/** Width accepted by desktop side-panel surface modes. */
export type VireoResponsiveOverlayFrameDesktopSidePanelWidth = ResponsiveOverlayFrameDesktopSidePanelWidth;

/** Desktop surface coordinated by the responsive frame. */
export type VireoResponsiveOverlayFrameDesktopSurface = ResponsiveOverlayFrameDesktopSurface;

export type VireoResponsiveOverlayFrameOwnerState = {
  open: boolean;
  isMobile: boolean;
  desktopSurface: VireoResponsiveOverlayFrameDesktopSurface;
  effectiveDesktopSurface: VireoResponsiveOverlayFrameDesktopSurface;
  allowSidePanelResize: boolean;
  sidePanelResizeEnabled: boolean;
  isResizing: boolean;
};

export interface VireoResponsiveOverlayFrameRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoResponsiveOverlayFrame}. */
export type VireoResponsiveOverlayFrameSlots = {
  [TSlotName in VireoResponsiveOverlayFrameSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoResponsiveOverlayFrame}. */
export type VireoResponsiveOverlayFrameSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoResponsiveOverlayFrameSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoResponsiveOverlayFrameRootSlotPropsOverrides, VireoResponsiveOverlayFrameOwnerState>;
  }
>;

/** Props owned by {@link VireoResponsiveOverlayFrame}. */
export type VireoResponsiveOverlayFrameOwnProps = VireoResponsiveOverlayFrameSlotsAndSlotProps & {
  /** Whether the selected overlay surface is open. */
  open: boolean;
  /** Closes the selected overlay surface. */
  onClose: () => void;
  /** Called after the selected overlay surface finishes leaving. */
  onExited?: () => void;
  /** Maximum width of the desktop dialog surface. @default 'lg' */
  maxWidth?: DialogProps["maxWidth"];
  /** Fixed height of the mobile bottom sheet. */
  mobileHeight?: string;
  /** Maximum height of a content-sized mobile bottom sheet. @default '92dvh' */
  mobileMaxHeight?: string;
  /** MUI system customization for the desktop dialog paper. */
  desktopPaperSx?: SxProps<Theme>;
  /** Requested width of desktop side-panel surfaces. */
  desktopSidePanelWidth?: VireoResponsiveOverlayFrameDesktopSidePanelWidth;
  /** Minimum width of desktop side-panel surfaces. @default 360 */
  desktopSidePanelMinWidth?: number;
  /** Minimum workspace width retained beside a docked panel. */
  desktopSidePanelMinContentWidth?: number;
  /** MUI system customization for desktop side-panel papers. */
  desktopSidePanelSx?: SxProps<Theme>;
  /** Surface used on desktop. @default 'dialog' */
  desktopSurface?: VireoResponsiveOverlayFrameDesktopSurface;
  /** Enables pointer resizing for desktop side-panel surfaces. @default false */
  allowSidePanelResize?: boolean;
  /** Width reserved by desktop navigation when deciding whether a docked panel fits. @default 0 */
  desktopNavWidth?: number;
  /** Contents rendered inside the selected surface. */
  children: React.ReactNode;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoResponsiveOverlayFrameClasses>;
};

/** Props VireoResponsiveOverlayFrame inherits from its default root after excluding component-owned props. */
export type VireoResponsiveOverlayFrameInheritedProps = Omit<
  BoxProps<"div">,
  "children" | "component" | "maxWidth" | "ref"
>;

/** Props accepted by {@link VireoResponsiveOverlayFrame}. */
export type VireoResponsiveOverlayFrameProps = VireoResponsiveOverlayFrameOwnProps &
  VireoResponsiveOverlayFrameInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_RESPONSIVE_OVERLAY_FRAME_NAME]?: VireoThemeComponent<
      VireoResponsiveOverlayFrameProps,
      VireoResponsiveOverlayFrameClassKey,
      VireoResponsiveOverlayFrameOwnerState,
      Theme
    >;
  }
}
