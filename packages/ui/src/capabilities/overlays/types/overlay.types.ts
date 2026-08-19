import { type DialogProps, type SxProps, type Theme } from "@mui/material";
import { type Breakpoint } from "@mui/material/styles";
import type React from "react";

export type ResponsiveOverlayFrameDesktopSidePanelWidth =
  number | string | Partial<Record<Breakpoint, number | string>>;

export type ResponsiveOverlayFrameDesktopSurface = "dialog" | "overlaySidePanel" | "dockedSidePanel";

export type ResponsiveOverlayFrameProps = {
  open: boolean;
  onClose: () => void;
  onExited?: () => void;
  maxWidth?: DialogProps["maxWidth"];
  mobileHeight?: string;
  mobileMaxHeight?: string;
  desktopPaperSx?: SxProps<Theme>;
  desktopSidePanelWidth?: ResponsiveOverlayFrameDesktopSidePanelWidth;
  desktopSidePanelMinWidth?: number;
  desktopSidePanelMinContentWidth?: number;
  desktopSidePanelSx?: SxProps<Theme>;
  desktopSurface?: ResponsiveOverlayFrameDesktopSurface;
  allowSidePanelResize?: boolean;
  desktopNavWidth?: number;
  children: React.ReactNode;
};
