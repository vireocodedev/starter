import { type Breakpoint } from "@mui/material/styles";

export type ResponsiveOverlayFrameDesktopSidePanelWidth =
  number | string | Partial<Record<Breakpoint, number | string>>;

export type ResponsiveOverlayFrameDesktopSurface = "dialog" | "overlaySidePanel" | "dockedSidePanel";
