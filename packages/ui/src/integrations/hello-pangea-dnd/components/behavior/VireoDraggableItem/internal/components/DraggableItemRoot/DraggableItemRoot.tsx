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
import { createPortal } from "react-dom";

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
  liftCorrection: { x: number; y: number };
  onPointerLiftStart: (event: React.PointerEvent<HTMLDivElement>) => void;
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
  liftCorrection,
  onPointerDownCapture,
  onPointerLiftStart,
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
    onPointerDownCapture: rootSlotOnPointerDownCapture,
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

  const handlePointerDownCapture = React.useCallback<React.PointerEventHandler<HTMLDivElement>>(
    event => {
      const consumerHandler = rootSlotOnPointerDownCapture ?? onPointerDownCapture;
      consumerHandler?.(event);
      if (event.button !== 0) return;
      onPointerLiftStart(event);
    },
    [onPointerDownCapture, onPointerLiftStart, rootSlotOnPointerDownCapture],
  );

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
  const draggableStyle = provided.draggableProps.style;
  const correctedDraggableStyle =
    snapshot.isDragging && draggableStyle && "position" in draggableStyle && draggableStyle.position === "fixed"
      ? {
          ...draggableStyle,
          left: typeof draggableStyle.left === "number" ? draggableStyle.left + liftCorrection.x : draggableStyle.left,
          top: typeof draggableStyle.top === "number" ? draggableStyle.top + liftCorrection.y : draggableStyle.top,
        }
      : draggableStyle;

  const draggableItem = (
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
        onPointerDownCapture={handlePointerDownCapture}
        style={{ ...style, ...rootSlotStyle, ...correctedDraggableStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        {children}
      </VireoDraggableItemRoot>
    </VireoDraggableItemContext.Provider>
  );

  return snapshot.isDragging && typeof document !== "undefined"
    ? createPortal(draggableItem, document.body)
    : draggableItem;
}
