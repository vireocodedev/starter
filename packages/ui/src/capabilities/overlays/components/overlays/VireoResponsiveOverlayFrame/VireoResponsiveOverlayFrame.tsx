import { VireoBottomDrawer } from "@/capabilities/overlays/components/overlays/VireoBottomDrawer";
import { VireoDockedSidePanel } from "@/capabilities/overlays/components/overlays/VireoDockedSidePanel";
import { VireoSidePanelResizeHandle } from "@/capabilities/overlays/components/overlays/VireoSidePanelResizeHandle";
import {
  DEFAULT_DESKTOP_SIDE_PANEL_MIN_WIDTH,
  DEFAULT_DESKTOP_SIDE_PANEL_MIN_CONTENT_WIDTH,
  DEFAULT_DESKTOP_SIDE_PANEL_VIEWPORT_INSET,
  SIDE_PANEL_WIDTH_CSS_VAR,
} from "@/capabilities/overlays/constants/overlay.constants";
import { useRafViewportWidth } from "@/capabilities/overlays/hooks/useRafViewportWidth/useRafViewportWidth";
import { useSidePanelResize } from "@/capabilities/overlays/hooks/useSidePanelResize/useSidePanelResize";
import {
  clampSidePanelWidth,
  getDefaultDesktopSidePanelWidth,
  getNumericDesktopSidePanelWidth,
  resolveDockedSidePanelWidth,
} from "@/capabilities/overlays/utils/overlay.utils";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { Dialog, Drawer, unstable_composeClasses as composeClasses, useMediaQuery } from "@mui/material";
import { useTheme, useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  type VireoResponsiveOverlayFrameClassKey,
  getVireoResponsiveOverlayFrameUtilityClass,
} from "./VireoResponsiveOverlayFrame.classes";
import {
  VIREO_RESPONSIVE_OVERLAY_FRAME_NAME,
  type VireoResponsiveOverlayFrameSlotName,
} from "./VireoResponsiveOverlayFrame.identity";
import { VireoResponsiveOverlayFrameRoot } from "./VireoResponsiveOverlayFrame.styled";
import {
  type ResponsiveOverlayFrameProps,
  type VireoResponsiveOverlayFrameOwnerState,
  type VireoResponsiveOverlayFrameProps,
} from "./VireoResponsiveOverlayFrame.types";

function useUtilityClasses(
  _ownerState: VireoResponsiveOverlayFrameOwnerState,
  classes?: VireoResponsiveOverlayFrameProps["classes"],
) {
  return composeClasses(
    {
      root: ["root"],
    } as const satisfies UtilityClassSlotMap<VireoResponsiveOverlayFrameSlotName, VireoResponsiveOverlayFrameClassKey>,
    getVireoResponsiveOverlayFrameUtilityClass,
    classes,
  );
}

/**
 * Selects and coordinates the appropriate mobile or desktop overlay surface for one responsive content flow.
 */
export const VireoResponsiveOverlayFrame = React.forwardRef<HTMLDivElement, VireoResponsiveOverlayFrameProps>(
  function VireoResponsiveOverlayFrame(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_RESPONSIVE_OVERLAY_FRAME_NAME });
    const {
      allowSidePanelResize = false,
      children,
      className,
      classes: classesProp,
      desktopNavWidth = 0,
      desktopPaperSx,
      desktopSidePanelMinContentWidth = DEFAULT_DESKTOP_SIDE_PANEL_MIN_CONTENT_WIDTH,
      desktopSidePanelMinWidth = DEFAULT_DESKTOP_SIDE_PANEL_MIN_WIDTH,
      desktopSidePanelSx,
      desktopSidePanelWidth,
      desktopSurface = "dialog",
      maxWidth = "lg",
      mobileHeight,
      mobileMaxHeight = "92dvh",
      onClose,
      onExited,
      open,
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isConfiguredDesktopSidePanelSurface =
      desktopSurface === "dockedSidePanel" || desktopSurface === "overlaySidePanel";
    const viewportTrackingEnabled =
      !isMobile &&
      (desktopSurface === "dockedSidePanel" || (allowSidePanelResize && isConfiguredDesktopSidePanelSurface));
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
    const effectiveDesktopSurface =
      desktopSurface === "dockedSidePanel" && !canFitDockedSidePanel ? "overlaySidePanel" : desktopSurface;
    const sidePanelResizeEnabled =
      allowSidePanelResize &&
      (effectiveDesktopSurface === "dockedSidePanel" || effectiveDesktopSurface === "overlaySidePanel");
    const sidePanelResizeMaxWidth =
      effectiveDesktopSurface === "dockedSidePanel" ? maxDockedSidePanelWidth : maxOverlaySidePanelWidth;
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

    const ownerState: VireoResponsiveOverlayFrameOwnerState = {
      open,
      isMobile,
      desktopSurface,
      effectiveDesktopSurface,
      allowSidePanelResize,
      sidePanelResizeEnabled,
      isResizing: sidePanelResize.isResizing,
    };
    const classes = useUtilityClasses(ownerState, classesProp);
    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);

    const resizedSidePanelWidth = `var(${SIDE_PANEL_WIDTH_CSS_VAR})`;
    const overlaySidePanelWidth = sidePanelResizeEnabled ? resizedSidePanelWidth : requestedDesktopSidePanelWidth;
    const dockedSidePanelWidth = sidePanelResizeEnabled
      ? resizedSidePanelWidth
      : resolveDockedSidePanelWidth(requestedDesktopSidePanelWidth, maxDockedSidePanelWidth, desktopSidePanelMinWidth);
    const sidePanelResizeHandle = (
      <VireoSidePanelResizeHandle
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

    let desktopFrame: React.ReactNode;
    if (effectiveDesktopSurface === "overlaySidePanel") {
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
          {children}
        </Drawer>
      );
    } else if (effectiveDesktopSurface === "dockedSidePanel") {
      desktopFrame = (
        <VireoDockedSidePanel
          open={open}
          width={dockedSidePanelWidth}
          minWidth={desktopSidePanelMinWidth}
          maxWidth={maxDockedSidePanelWidth}
          isResizing={sidePanelResize.isResizing}
          ref={sidePanelResizeEnabled ? sidePanelResize.rootRef : undefined}
          style={sidePanelResizeStyle}
          slotProps={desktopSidePanelSx ? { surface: { sx: desktopSidePanelSx } } : undefined}
          resizeHandle={sidePanelResizeHandle}
          onExited={handleExited}
        >
          {children}
        </VireoDockedSidePanel>
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
          {children}
        </Dialog>
      );
    }

    const frame = isMobile ? (
      <VireoBottomDrawer
        open={open}
        onClose={onClose}
        onExited={onExited}
        height={mobileHeight}
        maxHeight={drawerMaxHeight}
      >
        {children}
      </VireoBottomDrawer>
    ) : (
      desktopFrame
    );

    return (
      <VireoResponsiveOverlayFrameRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        {frame}
      </VireoResponsiveOverlayFrameRoot>
    );
  },
);

VireoResponsiveOverlayFrame.displayName = VIREO_RESPONSIVE_OVERLAY_FRAME_NAME;

/** @deprecated Use {@link VireoResponsiveOverlayFrame}. */
export function ResponsiveOverlayFrame(props: ResponsiveOverlayFrameProps) {
  return <VireoResponsiveOverlayFrame {...props} />;
}
