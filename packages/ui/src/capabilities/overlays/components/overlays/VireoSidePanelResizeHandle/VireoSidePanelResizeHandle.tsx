import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  type VireoSidePanelResizeHandleClassKey,
  getVireoSidePanelResizeHandleUtilityClass,
} from "./VireoSidePanelResizeHandle.classes";
import {
  VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME,
  type VireoSidePanelResizeHandleSlotName,
} from "./VireoSidePanelResizeHandle.identity";
import { VireoSidePanelResizeHandleRoot } from "./VireoSidePanelResizeHandle.styled";
import {
  type VireoSidePanelResizeHandleOwnerState,
  type VireoSidePanelResizeHandleProps,
} from "./VireoSidePanelResizeHandle.types";

function useUtilityClasses(
  ownerState: VireoSidePanelResizeHandleOwnerState,
  classes?: VireoSidePanelResizeHandleProps["classes"],
) {
  return composeClasses(
    {
      root: ["root", ownerState.isResizing && "resizing"],
    } as const satisfies UtilityClassSlotMap<VireoSidePanelResizeHandleSlotName, VireoSidePanelResizeHandleClassKey>,
    getVireoSidePanelResizeHandleUtilityClass,
    classes,
  );
}

/**
 * Renders the pointer and keyboard interaction target for resizing a Vireo side panel.
 */
export const VireoSidePanelResizeHandle = React.forwardRef<HTMLDivElement, VireoSidePanelResizeHandleProps>(
  function VireoSidePanelResizeHandle(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME });
    const {
      "aria-label": ariaLabel = "Resize panel",
      className,
      classes: classesProp,
      enabled = true,
      isResizing = false,
      onResizeDoubleClick,
      onResizeKeyDown,
      onResizeStart,
      slotProps = {},
      slots = {},
      style,
      sx,
      valueMax,
      valueMin,
      valueNow,
      ...other
    } = props;

    const ownerState: VireoSidePanelResizeHandleOwnerState = { enabled, isResizing };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      onDoubleClick: rootSlotOnDoubleClick,
      onKeyDown: rootSlotOnKeyDown,
      onMouseDown: rootSlotOnMouseDown,
      onPointerDown: rootSlotOnPointerDown,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);

    const handlePointerDown = React.useCallback<React.PointerEventHandler<HTMLDivElement>>(
      event => {
        rootSlotOnPointerDown?.(event);
        if (!event.defaultPrevented) rootSlotOnMouseDown?.(event);
        if (!event.defaultPrevented) onResizeStart(event);
      },
      [onResizeStart, rootSlotOnMouseDown, rootSlotOnPointerDown],
    );
    const handleKeyDown = React.useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
      event => {
        rootSlotOnKeyDown?.(event);
        if (!event.defaultPrevented) onResizeKeyDown?.(event);
      },
      [onResizeKeyDown, rootSlotOnKeyDown],
    );
    const handleDoubleClick = React.useCallback<React.MouseEventHandler<HTMLDivElement>>(
      event => {
        rootSlotOnDoubleClick?.(event);
        if (!event.defaultPrevented) onResizeDoubleClick(event);
      },
      [onResizeDoubleClick, rootSlotOnDoubleClick],
    );

    if (!ownerState.enabled) return null;
    const keyboardEnabled =
      Boolean(onResizeKeyDown) && valueMin !== undefined && valueMax !== undefined && valueNow !== undefined;

    return (
      <VireoSidePanelResizeHandleRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
        role={keyboardEnabled ? "separator" : "presentation"}
        tabIndex={keyboardEnabled ? 0 : undefined}
        aria-label={keyboardEnabled ? ariaLabel : undefined}
        aria-orientation={keyboardEnabled ? "vertical" : undefined}
        aria-valuemin={keyboardEnabled ? valueMin : undefined}
        aria-valuemax={keyboardEnabled ? valueMax : undefined}
        aria-valuenow={keyboardEnabled ? valueNow : undefined}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        onDoubleClick={handleDoubleClick}
      />
    );
  },
);

VireoSidePanelResizeHandle.displayName = VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME;
