import { DESKTOP_SIDE_PANEL_WIDTH_BY_MAX_WIDTH } from "@/capabilities/overlays/constants/overlay.constants";
import { type ResponsiveOverlayFrameDesktopSidePanelWidth } from "@/capabilities/overlays/types/overlay.types";
import { type DialogProps } from "@mui/material";

export function getDefaultDesktopSidePanelWidth(maxWidth: DialogProps["maxWidth"]): number {
  if (!maxWidth) {
    return 760;
  }

  return DESKTOP_SIDE_PANEL_WIDTH_BY_MAX_WIDTH[maxWidth];
}

export function getNumericDesktopSidePanelWidth(
  width: ResponsiveOverlayFrameDesktopSidePanelWidth,
  maxWidth: DialogProps["maxWidth"],
): number {
  if (typeof width === "number" && Number.isFinite(width)) {
    return width;
  }

  return getDefaultDesktopSidePanelWidth(maxWidth);
}

export function clampSidePanelWidth(width: number, minWidth: number, maxWidth: number): number {
  const effectiveMaxWidth = Math.max(minWidth, maxWidth);

  return Math.max(minWidth, Math.min(width, effectiveMaxWidth));
}

/** Resolves docked side panel width. */
export function resolveDockedSidePanelWidth(
  requestedWidth: ResponsiveOverlayFrameDesktopSidePanelWidth,
  maxWidth: number,
  minWidth: number,
): ResponsiveOverlayFrameDesktopSidePanelWidth {
  if (typeof requestedWidth !== "number") {
    return requestedWidth;
  }

  return clampSidePanelWidth(requestedWidth, minWidth, maxWidth);
}
