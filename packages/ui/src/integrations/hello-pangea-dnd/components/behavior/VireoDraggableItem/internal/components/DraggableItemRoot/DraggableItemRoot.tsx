import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import {
  type VireoDraggableItemClassKey,
  getVireoDraggableItemUtilityClass,
} from "@/integrations/hello-pangea-dnd/components/behavior/VireoDraggableItem/VireoDraggableItem.classes";
import type { VireoDraggableItemSlotName } from "@/integrations/hello-pangea-dnd/components/behavior/VireoDraggableItem/VireoDraggableItem.identity";
import { VireoDraggableItemRoot } from "@/integrations/hello-pangea-dnd/components/behavior/VireoDraggableItem/VireoDraggableItem.styled";
import type {
  VireoDraggableItemOwnerState,
  VireoDraggableItemProps,
} from "@/integrations/hello-pangea-dnd/components/behavior/VireoDraggableItem/VireoDraggableItem.types";
import { VireoDraggableItemContext } from "@/integrations/hello-pangea-dnd/contexts/VireoDraggableItemContext/VireoDraggableItemContext";
import type { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useForkRef } from "@mui/material/utils";
import React from "react";

function useUtilityClasses(ownerState: VireoDraggableItemOwnerState, classes?: VireoDraggableItemProps["classes"]) {
  return composeClasses(
    {
      root: ["root", ownerState.disabled && "disabled", ownerState.isDragging && "dragging"],
    } as const satisfies UtilityClassSlotMap<VireoDraggableItemSlotName, VireoDraggableItemClassKey>,
    getVireoDraggableItemUtilityClass,
    classes,
  );
}

type DraggableItemRootProps = Omit<
  VireoDraggableItemProps,
  | "allowDragFromInteractiveElements"
  | "disabled"
  | "disableDefaultFeedback"
  | "dragHandle"
  | "id"
  | "index"
  | "respectForcePress"
> & {
  disabled: boolean;
  disableDefaultFeedback: boolean;
  dragHandle: "explicit" | "root";
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
};

export function DraggableItemRoot({
  children,
  className,
  classes: classesProp,
  disabled,
  disableDefaultFeedback,
  dragHandle,
  forwardedRef,
  provided,
  slotProps = {},
  slots = {},
  snapshot,
  style,
  sx,
  ...other
}: DraggableItemRootProps) {
  const ownerState: VireoDraggableItemOwnerState = {
    disabled,
    disableDefaultFeedback,
    dragHandle,
    isDragging: snapshot.isDragging,
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
  const rootRef = useForkRef(forwardedRef, rootSlotRef, provided.innerRef);
  const handleCountRef = React.useRef(0);
  const registerHandle = React.useCallback(() => {
    handleCountRef.current += 1;
    return () => {
      handleCountRef.current -= 1;
    };
  }, []);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" && dragHandle === "explicit" && handleCountRef.current === 0) {
      console.warn('VireoDraggableItem with dragHandle="explicit" requires a mounted VireoDragHandle.');
    }
  }, [dragHandle]);

  const contextValue = React.useMemo(
    () => ({
      disabled,
      explicitHandle: dragHandle === "explicit",
      isDragging: snapshot.isDragging,
      dragHandleProps: provided.dragHandleProps,
      registerHandle,
    }),
    [disabled, dragHandle, provided.dragHandleProps, registerHandle, snapshot.isDragging],
  );
  const nativeHandleProps = dragHandle === "root" ? provided.dragHandleProps : undefined;

  return (
    <VireoDraggableItemContext.Provider value={contextValue}>
      <VireoDraggableItemRoot
        {...other}
        {...rootSlotOther}
        {...provided.draggableProps}
        {...nativeHandleProps}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        data-dragging={snapshot.isDragging ? "true" : "false"}
        style={{ ...style, ...rootSlotStyle, ...provided.draggableProps.style }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        {children}
      </VireoDraggableItemRoot>
    </VireoDraggableItemContext.Provider>
  );
}
