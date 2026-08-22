"use client";

import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { VireoDraggableItemContext } from "@/integrations/hello-pangea-dnd/contexts/VireoDraggableItemContext/VireoDraggableItemContext";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoDragHandleClassKey, getVireoDragHandleUtilityClass } from "./VireoDragHandle.classes";
import { VIREO_DRAG_HANDLE_NAME, type VireoDragHandleSlotName } from "./VireoDragHandle.identity";
import { VireoDragHandleIcon, VireoDragHandleRoot } from "./VireoDragHandle.styled";
import type { VireoDragHandleOwnerState, VireoDragHandleProps } from "./VireoDragHandle.types";

function useUtilityClasses(ownerState: VireoDragHandleOwnerState, classes?: VireoDragHandleProps["classes"]) {
  return composeClasses(
    {
      root: ["root", ownerState.disabled && "disabled", ownerState.isDragging && "dragging"],
      icon: ["icon"],
    } as const satisfies UtilityClassSlotMap<VireoDragHandleSlotName, VireoDragHandleClassKey>,
    getVireoDragHandleUtilityClass,
    classes,
  );
}

/** Renders the accessible dedicated grip for an explicit-handle VireoDraggableItem. */
export const VireoDragHandle = React.forwardRef<HTMLButtonElement, VireoDragHandleProps>(
  function VireoDragHandle(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_DRAG_HANDLE_NAME });
    const { children, className, classes: classesProp, slotProps = {}, slots = {}, style, sx, ...other } = props;
    const context = React.useContext(VireoDraggableItemContext);
    if (!context?.explicitHandle) {
      throw new Error('VireoDragHandle must be used inside VireoDraggableItem with dragHandle="explicit".');
    }
    const { registerHandle } = context;

    React.useEffect(() => registerHandle(), [registerHandle]);

    const ownerState: VireoDragHandleOwnerState = {
      disabled: context.disabled,
      isDragging: context.isDragging,
    };
    const classes = useUtilityClasses(ownerState, classesProp);
    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const resolvedIconSlotProps = resolveSlotProps(slotProps.icon, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const { className: iconSlotClassName, ...iconSlotOther } = resolvedIconSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);

    return (
      <VireoDragHandleRoot
        {...other}
        {...rootSlotOther}
        {...context.dragHandleProps}
        as={slots.root}
        ref={rootRef}
        ownerState={ownerState}
        disabled={context.disabled}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        data-dragging={context.isDragging ? "true" : "false"}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        {children ?? (
          <VireoDragHandleIcon
            {...iconSlotOther}
            as={slots.icon}
            ownerState={ownerState}
            className={joinClassNames(classes.icon, iconSlotClassName)}
          />
        )}
      </VireoDragHandleRoot>
    );
  },
);

VireoDragHandle.displayName = VIREO_DRAG_HANDLE_NAME;
