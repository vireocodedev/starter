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
import { Dialog, Drawer, Slide, unstable_composeClasses as composeClasses, useMediaQuery } from "@mui/material";
import { useTheme, useThemeProps } from "@mui/material/styles";
import { type TransitionProps } from "@mui/material/transitions";
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
  type VireoResponsiveOverlayFrameOwnerState,
  type VireoResponsiveOverlayFrameProps,
} from "./VireoResponsiveOverlayFrame.types";

const MobileFullScreenTransition = React.forwardRef<
  unknown,
  TransitionProps & { children: React.ReactElement<unknown> }
>(function MobileFullScreenTransition(transitionProps, ref) {
  return <Slide direction="up" ref={ref} {...transitionProps} />;
});

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
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
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
      mobileSurface = "fullScreenDialog",
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
      mobileSurface,
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
        onResizeKeyDown={sidePanelResize.onResizeKeyDown}
        onResizeDoubleClick={sidePanelResize.onResizeDoubleClick}
        valueMin={desktopSidePanelMinWidth}
        valueMax={sidePanelResizeMaxWidth}
        valueNow={sidePanelResize.width}
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
              "aria-label": ariaLabel,
              "aria-labelledby": ariaLabelledby,
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
            transition: { appear: true, onExited: handleExited },
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
          slotProps={{
            surface: {
              "aria-label": ariaLabel,
              "aria-labelledby": ariaLabelledby,
              role: ariaLabel || ariaLabelledby ? "region" : undefined,
              sx: desktopSidePanelSx,
            },
          }}
          resizeHandle={sidePanelResizeHandle}
          onExited={handleExited}
        >
          {children}
        </VireoDockedSidePanel>
      );
    } else {
      desktopFrame = (
        <Dialog
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          open={open}
          onClose={onClose}
          maxWidth={maxWidth}
          fullWidth
          slotProps={{
            paper: { "aria-label": ariaLabel, sx: desktopPaperSx },
            transition: { onExited },
          }}
        >
          {children}
        </Dialog>
      );
    }

    const mobileFrame =
      mobileSurface === "fullScreenDialog" ? (
        <Dialog
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          open={open}
          onClose={onClose}
          fullScreen
          slots={{ transition: MobileFullScreenTransition }}
          slotProps={{
            paper: { "aria-label": ariaLabel, sx: { overflow: "hidden" } },
            transition: { onExited: handleExited },
          }}
        >
          {children}
        </Dialog>
      ) : (
        <VireoBottomDrawer
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          open={open}
          onClose={onClose}
          onExited={onExited}
          height={mobileHeight}
          maxHeight={drawerMaxHeight}
        >
          {children}
        </VireoBottomDrawer>
      );

    const frame = isMobile ? mobileFrame : desktopFrame;

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
