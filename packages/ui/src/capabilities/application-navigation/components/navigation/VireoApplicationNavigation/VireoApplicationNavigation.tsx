import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { VireoApplicationNavigationContext } from "@/capabilities/application-navigation/contexts/VireoApplicationNavigationContext/VireoApplicationNavigationContext";
import { VireoSidePanelResizeHandle } from "@/capabilities/overlays/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  type VireoApplicationNavigationClassKey,
  getVireoApplicationNavigationUtilityClass,
} from "./VireoApplicationNavigation.classes";
import {
  VIREO_APPLICATION_NAVIGATION_NAME,
  type VireoApplicationNavigationSlotName,
} from "./VireoApplicationNavigation.identity";
import {
  VireoApplicationNavigationContent,
  VireoApplicationNavigationRoot,
  VireoApplicationNavigationSurface,
} from "./VireoApplicationNavigation.styled";
import {
  VIREO_APPLICATION_NAVIGATION_DEFAULT_COMPACT_WIDTH,
  VIREO_APPLICATION_NAVIGATION_DEFAULT_EXPANDED_WIDTH,
  VIREO_APPLICATION_NAVIGATION_MAX_EXPANDED_WIDTH,
  VIREO_APPLICATION_NAVIGATION_MIN_EXPANDED_WIDTH,
  VIREO_APPLICATION_NAVIGATION_WIDTH_CSS_VAR,
  type VireoApplicationNavigationOwnerState,
  type VireoApplicationNavigationProps,
} from "./VireoApplicationNavigation.types";

function useUtilityClasses(
  ownerState: VireoApplicationNavigationOwnerState,
  classes?: VireoApplicationNavigationProps["classes"],
) {
  return composeClasses(
    {
      root: ["root"],
      surface: ["surface"],
      content: ["content"],
      resizeHandle: ["resizeHandle"],
    } as const satisfies UtilityClassSlotMap<VireoApplicationNavigationSlotName, VireoApplicationNavigationClassKey>,
    getVireoApplicationNavigationUtilityClass,
    classes,
  );
}

/**
 * Provides a responsive, resizable application-navigation surface with persistent expanded and compact modes.
 */
export const VireoApplicationNavigation = React.forwardRef<HTMLDivElement, VireoApplicationNavigationProps>(
  function VireoApplicationNavigation(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_APPLICATION_NAVIGATION_NAME });
    const {
      children,
      className,
      classes: classesProp,
      collapseThreshold,
      compactWidth = VIREO_APPLICATION_NAVIGATION_DEFAULT_COMPACT_WIDTH,
      defaultExpandedWidth = VIREO_APPLICATION_NAVIGATION_DEFAULT_EXPANDED_WIDTH,
      expandedWidth = VIREO_APPLICATION_NAVIGATION_DEFAULT_EXPANDED_WIDTH,
      locked = false,
      maxExpandedWidth = VIREO_APPLICATION_NAVIGATION_MAX_EXPANDED_WIDTH,
      minExpandedWidth = VIREO_APPLICATION_NAVIGATION_MIN_EXPANDED_WIDTH,
      mode = "expanded",
      onClose,
      onExpandedWidthChange,
      onModeChange,
      open = false,
      resizable = true,
      slotProps = {},
      slots = {},
      style,
      sx,
      variant = "permanent",
      ...other
    } = props;

    const clampExpandedWidth = React.useCallback(
      (value: number) => Math.min(maxExpandedWidth, Math.max(minExpandedWidth, value)),
      [maxExpandedWidth, minExpandedWidth],
    );
    const resolvedCollapseThreshold = collapseThreshold ?? minExpandedWidth;
    const resolvedMode = variant === "temporary" ? "expanded" : mode;
    const effectiveResizable = variant === "permanent" && resizable && !locked;
    const controlledExpandedWidth = clampExpandedWidth(expandedWidth);
    const controlledWidth = resolvedMode === "compact" ? compactWidth : controlledExpandedWidth;
    const [preview, setPreview] = React.useState<{ mode: "compact" | "expanded"; width: number } | null>(null);
    const cleanupResizeRef = React.useRef<(() => void) | null>(null);
    const isResizing = preview !== null;
    const activeMode = preview?.mode ?? resolvedMode;
    const width = preview?.width ?? controlledWidth;

    React.useEffect(() => () => cleanupResizeRef.current?.(), []);

    const ownerState: VireoApplicationNavigationOwnerState = {
      mode: activeMode,
      variant,
      width,
      isResizing,
      resizable: effectiveResizable,
      locked,
    };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const resolvedSurfaceSlotProps = resolveSlotProps(slotProps.surface, ownerState);
    const resolvedContentSlotProps = resolveSlotProps(slotProps.content, ownerState);
    const resolvedResizeHandleSlotProps = resolveSlotProps(slotProps.resizeHandle, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);

    const { className: surfaceSlotClassName, sx: surfaceSlotSx, ...surfaceSlotOther } = resolvedSurfaceSlotProps;
    const { className: contentSlotClassName, sx: contentSlotSx, ...contentSlotOther } = resolvedContentSlotProps;
    const {
      className: resizeHandleSlotClassName,
      sx: resizeHandleSlotSx,
      ...resizeHandleSlotOther
    } = resolvedResizeHandleSlotProps;

    const toggleMode = React.useCallback(() => {
      if (variant !== "permanent" || locked) return;
      onModeChange?.(resolvedMode === "compact" ? "expanded" : "compact");
    }, [locked, onModeChange, resolvedMode, variant]);

    const handleResizeStart = React.useCallback<React.MouseEventHandler<HTMLDivElement>>(
      event => {
        if (!effectiveResizable) return;
        event.preventDefault();
        cleanupResizeRef.current?.();

        const startX = event.clientX;
        const startWidth = width;
        let nextMode = activeMode;
        let nextWidth = width;
        const previousCursor = document.body.style.cursor;
        const previousUserSelect = document.body.style.userSelect;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        setPreview({ mode: activeMode, width });

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const candidate = startWidth + moveEvent.clientX - startX;
          if (candidate < resolvedCollapseThreshold) {
            nextMode = "compact";
            nextWidth = compactWidth;
          } else {
            nextMode = "expanded";
            nextWidth = clampExpandedWidth(candidate);
          }
          setPreview({ mode: nextMode, width: nextWidth });
        };
        const cleanup = () => {
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("mouseup", handleMouseUp);
          document.body.style.cursor = previousCursor;
          document.body.style.userSelect = previousUserSelect;
          cleanupResizeRef.current = null;
          setPreview(null);
        };
        const handleMouseUp = () => {
          cleanup();
          if (nextMode !== resolvedMode) onModeChange?.(nextMode);
          if (nextMode === "expanded" && nextWidth !== controlledExpandedWidth) {
            onExpandedWidthChange?.(nextWidth);
          }
        };

        cleanupResizeRef.current = cleanup;
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
      },
      [
        activeMode,
        clampExpandedWidth,
        compactWidth,
        controlledExpandedWidth,
        effectiveResizable,
        onExpandedWidthChange,
        onModeChange,
        resolvedCollapseThreshold,
        resolvedMode,
        width,
      ],
    );

    const handleResizeDoubleClick = React.useCallback<React.MouseEventHandler<HTMLDivElement>>(
      event => {
        if (!effectiveResizable) return;
        event.preventDefault();
        if (resolvedMode !== "expanded") onModeChange?.("expanded");
        onExpandedWidthChange?.(clampExpandedWidth(defaultExpandedWidth));
      },
      [clampExpandedWidth, defaultExpandedWidth, effectiveResizable, onExpandedWidthChange, onModeChange, resolvedMode],
    );

    const SurfaceSlot = slots.surface ?? VireoApplicationNavigationSurface;
    const ContentSlot = slots.content ?? VireoApplicationNavigationContent;
    const ResizeHandleSlot = slots.resizeHandle ?? VireoSidePanelResizeHandle;
    const renderState = { mode: activeMode, width, isResizing, toggleMode };
    const renderedChildren = typeof children === "function" ? children(renderState) : children;

    return (
      <VireoApplicationNavigationRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={
          {
            [VIREO_APPLICATION_NAVIGATION_WIDTH_CSS_VAR]: `${width}px`,
            ...style,
            ...rootSlotStyle,
          } as React.CSSProperties
        }
        sx={mergeSx(sx, rootSlotSx)}
      >
        <SurfaceSlot
          {...surfaceSlotOther}
          ownerState={ownerState}
          className={joinClassNames(classes.surface, surfaceSlotClassName)}
          sx={surfaceSlotSx}
          variant={variant}
          open={variant === "permanent" || open}
          onClose={onClose}
        >
          <VireoApplicationNavigationContext.Provider value={{ mode: activeMode }}>
            <ContentSlot
              {...contentSlotOther}
              ownerState={ownerState}
              className={joinClassNames(classes.content, contentSlotClassName)}
              sx={contentSlotSx}
            >
              {renderedChildren}
              {variant === "permanent" && (
                <ResizeHandleSlot
                  {...resizeHandleSlotOther}
                  enabled={effectiveResizable}
                  isResizing={isResizing}
                  onResizeStart={handleResizeStart}
                  onResizeDoubleClick={handleResizeDoubleClick}
                  className={joinClassNames(classes.resizeHandle, resizeHandleSlotClassName)}
                  sx={mergeSx(
                    {
                      left: "auto",
                      right: 0,
                      "&::after": { left: "auto", right: 0 },
                    },
                    resizeHandleSlotSx,
                  )}
                />
              )}
            </ContentSlot>
          </VireoApplicationNavigationContext.Provider>
        </SurfaceSlot>
      </VireoApplicationNavigationRoot>
    );
  },
);

VireoApplicationNavigation.displayName = VIREO_APPLICATION_NAVIGATION_NAME;
