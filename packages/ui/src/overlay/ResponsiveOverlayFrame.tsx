import { DockedSidePanel } from "./DockedSidePanel";
import { SidePanelResizeHandle } from "./SidePanelResizeHandle";
import { useRafViewportWidth } from "./useRafViewportWidth";
import { useSidePanelResize } from "./useSidePanelResize";
import {
  DEFAULT_DESKTOP_SIDE_PANEL_MIN_WIDTH,
  DEFAULT_DESKTOP_SIDE_PANEL_VIEWPORT_INSET,
  SIDE_PANEL_WIDTH_CSS_VAR,
} from "./overlay.constants";
import { type ResponsiveOverlayFrameProps } from "./overlay.types";
import {
  clampSidePanelWidth,
  getDefaultDesktopSidePanelWidth,
  getNumericDesktopSidePanelWidth,
  mergeSx,
  resolveDockedSidePanelWidth,
} from "./overlay.utils";
import { Dialog, Drawer } from "@mui/material";
import { AppBottomDrawer } from "@/components/AppBottomDrawer";
import { useResponsiveProps } from "@/hooks/useResponsiveProps";
import { APP_PAGE_CONTENT_MIN_WIDTH } from "@/layout/appPageContent.constants";
import React from "react";

export function ResponsiveOverlayFrame({
  open,
  onClose,
  onExited,
  maxWidth = "lg",
  mobileHeight,
  mobileMaxHeight = "92dvh",
  desktopPaperSx,
  desktopSidePanelWidth,
  desktopSidePanelMinWidth = DEFAULT_DESKTOP_SIDE_PANEL_MIN_WIDTH,
  desktopSidePanelMinContentWidth = APP_PAGE_CONTENT_MIN_WIDTH,
  desktopSidePanelSx,
  desktopSurface = "dialog",
  allowSidePanelResize = false,
  desktopNavWidth = 0,
  children,
}: ResponsiveOverlayFrameProps) {
  const isConfiguredDesktopSidePanelSurface =
    desktopSurface === "dockedSidePanel" || desktopSurface === "overlaySidePanel";
  const viewportTrackingEnabled = useResponsiveProps<boolean>({
    mobile: false,
    desktop: desktopSurface === "dockedSidePanel" || (allowSidePanelResize && isConfiguredDesktopSidePanelSurface),
  });
  const viewportWidth = useRafViewportWidth(viewportTrackingEnabled);
  const drawerMaxHeight = mobileHeight ? undefined : mobileMaxHeight;
  const requestedDesktopSidePanelWidth = desktopSidePanelWidth ?? getDefaultDesktopSidePanelWidth(maxWidth);
  const requestedDesktopSidePanelNumericWidth = getNumericDesktopSidePanelWidth(
    requestedDesktopSidePanelWidth,
    maxWidth,
  );
  const desktopAvailableWidth = Math.max(0, viewportWidth - desktopNavWidth);
  const maxDockedSidePanelWidth = Math.max(0, desktopAvailableWidth - desktopSidePanelMinContentWidth);
  const maxOverlaySidePanelWidth = Math.max(
    desktopSidePanelMinWidth,
    viewportWidth - DEFAULT_DESKTOP_SIDE_PANEL_VIEWPORT_INSET,
  );
  const canFitDockedSidePanel = maxDockedSidePanelWidth >= desktopSidePanelMinWidth;
  const effectiveDesktopSurfaceDisplay =
    desktopSurface === "dockedSidePanel" && !canFitDockedSidePanel ? "overlaySidePanel" : desktopSurface;
  const sidePanelResizeEnabled =
    allowSidePanelResize &&
    (effectiveDesktopSurfaceDisplay === "dockedSidePanel" || effectiveDesktopSurfaceDisplay === "overlaySidePanel");
  const sidePanelResizeMaxWidth =
    effectiveDesktopSurfaceDisplay === "dockedSidePanel" ? maxDockedSidePanelWidth : maxOverlaySidePanelWidth;
  const sidePanelResizeInitialWidth = clampSidePanelWidth(
    requestedDesktopSidePanelNumericWidth,
    desktopSidePanelMinWidth,
    sidePanelResizeMaxWidth,
  );
  const sidePanelResize = useSidePanelResize({
    enabled: sidePanelResizeEnabled,
    initialWidth: sidePanelResizeInitialWidth,
    minWidth: desktopSidePanelMinWidth,
    maxWidth: sidePanelResizeMaxWidth,
  });
  const resizedSidePanelWidth = `var(${SIDE_PANEL_WIDTH_CSS_VAR})`;
  const overlaySidePanelWidth = sidePanelResizeEnabled ? resizedSidePanelWidth : requestedDesktopSidePanelWidth;
  const dockedSidePanelWidth = sidePanelResizeEnabled
    ? resizedSidePanelWidth
    : resolveDockedSidePanelWidth(requestedDesktopSidePanelWidth, maxDockedSidePanelWidth, desktopSidePanelMinWidth);
  const sidePanelResizeHandle = (
    <SidePanelResizeHandle
      enabled={sidePanelResizeEnabled}
      isResizing={sidePanelResize.isResizing}
      onResizeStart={sidePanelResize.onResizeStart}
      onResizeDoubleClick={sidePanelResize.onResizeDoubleClick}
    />
  );
  const sidePanelResizeStyle = sidePanelResizeEnabled
    ? ({ [SIDE_PANEL_WIDTH_CSS_VAR]: `${sidePanelResize.width}px` } as React.CSSProperties)
    : undefined;
  const handleExited = React.useCallback(() => onExited?.(), [onExited]);
  const content = children;

  let desktopFrame: React.ReactNode;
  if (effectiveDesktopSurfaceDisplay === "overlaySidePanel") {
    desktopFrame = (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            ref: sidePanelResizeEnabled ? sidePanelResize.rootRef : undefined,
            style: sidePanelResizeStyle,
            sx: mergeSx(
              {
                width: overlaySidePanelWidth,
                maxWidth: sidePanelResizeEnabled ? sidePanelResizeMaxWidth : "100vw",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              },
              desktopSidePanelSx,
            ),
          },
          transition: { onExited: handleExited },
        }}
      >
        {sidePanelResizeHandle}
        {content}
      </Drawer>
    );
  } else if (effectiveDesktopSurfaceDisplay === "dockedSidePanel") {
    desktopFrame = (
      <DockedSidePanel
        open={open}
        width={dockedSidePanelWidth}
        minWidth={desktopSidePanelMinWidth}
        maxWidth={maxDockedSidePanelWidth}
        isResizing={sidePanelResize.isResizing}
        rootRef={sidePanelResizeEnabled ? sidePanelResize.rootRef : undefined}
        style={sidePanelResizeStyle}
        sx={desktopSidePanelSx}
        resizeHandle={sidePanelResizeHandle}
        onExited={handleExited}
      >
        {content}
      </DockedSidePanel>
    );
  } else {
    desktopFrame = (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={maxWidth}
        fullWidth
        slotProps={desktopPaperSx ? { paper: { sx: desktopPaperSx } } : undefined}
        TransitionProps={{ onExited }}
      >
        {content}
      </Dialog>
    );
  }

  return useResponsiveProps<React.ReactNode>({
    mobile: (
      <AppBottomDrawer
        open={open}
        onClose={onClose}
        onExited={onExited}
        height={mobileHeight}
        maxHeight={drawerMaxHeight}
      >
        {content}
      </AppBottomDrawer>
    ),
    desktop: desktopFrame,
  });
}
