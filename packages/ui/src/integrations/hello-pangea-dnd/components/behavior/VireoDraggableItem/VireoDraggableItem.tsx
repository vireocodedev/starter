"use client";

import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { VireoDraggableItemContext } from "@/integrations/hello-pangea-dnd/contexts/VireoDraggableItemContext/VireoDraggableItemContext";
import { VireoDndContext } from "@/integrations/hello-pangea-dnd/contexts/VireoDndContext/VireoDndContext";
import { encodeDndIdentifier } from "@/integrations/hello-pangea-dnd/utils/dndIdCodec";
import { type DraggableProvided, type DraggableStateSnapshot, Draggable } from "@hello-pangea/dnd";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { createPortal } from "react-dom";
import { type VireoDraggableItemClassKey, getVireoDraggableItemUtilityClass } from "./VireoDraggableItem.classes";
import { VIREO_DRAGGABLE_ITEM_NAME, type VireoDraggableItemSlotName } from "./VireoDraggableItem.identity";
import { VireoDraggableItemRoot } from "./VireoDraggableItem.styled";
import type { VireoDraggableItemOwnerState, VireoDraggableItemProps } from "./VireoDraggableItem.types";

function useUtilityClasses(ownerState: VireoDraggableItemOwnerState, classes?: VireoDraggableItemProps["classes"]) {
  return composeClasses(
    {
      root: ["root", ownerState.disabled && "disabled", ownerState.isDragging && "dragging"],
    } as const satisfies UtilityClassSlotMap<VireoDraggableItemSlotName, VireoDraggableItemClassKey>,
    getVireoDraggableItemUtilityClass,
    classes,
  );
}

type PointerPosition = { x: number; y: number };

const ZERO_POINTER_OFFSET: PointerPosition = { x: 0, y: 0 };

function usePointerLiftCorrection() {
  const initialPointerPositionRef = React.useRef<PointerPosition | null>(null);
  const latestPointerPositionRef = React.useRef<PointerPosition | null>(null);
  const liftCorrectionRef = React.useRef<PointerPosition | null>(null);

  const trackPointerPosition = React.useCallback((event: PointerEvent) => {
    latestPointerPositionRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const stopPointerTracking = React.useCallback(() => {
    window.removeEventListener("pointermove", trackPointerPosition, true);
    window.removeEventListener("pointerup", stopPointerTracking, true);
    window.removeEventListener("pointercancel", stopPointerTracking, true);
    initialPointerPositionRef.current = null;
    latestPointerPositionRef.current = null;
  }, [trackPointerPosition]);

  React.useEffect(() => stopPointerTracking, [stopPointerTracking]);

  const capturePointerLift = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      stopPointerTracking();
      const point = { x: event.clientX, y: event.clientY };
      initialPointerPositionRef.current = point;
      latestPointerPositionRef.current = point;
      liftCorrectionRef.current = null;
      window.addEventListener("pointermove", trackPointerPosition, true);
      window.addEventListener("pointerup", stopPointerTracking, true);
      window.addEventListener("pointercancel", stopPointerTracking, true);
    },
    [stopPointerTracking, trackPointerPosition],
  );

  const getPointerLiftCorrection = React.useCallback((isDragging: boolean): PointerPosition => {
    if (!isDragging) {
      liftCorrectionRef.current = null;
      return ZERO_POINTER_OFFSET;
    }
    if (liftCorrectionRef.current === null) {
      const initialPointer = initialPointerPositionRef.current;
      const latestPointer = latestPointerPositionRef.current;
      liftCorrectionRef.current =
        initialPointer && latestPointer
          ? { x: latestPointer.x - initialPointer.x, y: latestPointer.y - initialPointer.y }
          : ZERO_POINTER_OFFSET;
    }
    return liftCorrectionRef.current;
  }, []);

  return { capturePointerLift, getPointerLiftCorrection };
}

type RenderedDraggableItemRootProps = Omit<
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
  liftCorrection: PointerPosition;
  onPointerLiftStart: (event: React.PointerEvent<HTMLDivElement>) => void;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
};

/** Keeps hook-based slot and ref orchestration legal inside Draggable's render-prop boundary. */
function RenderedDraggableItemRoot({
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
}: RenderedDraggableItemRootProps) {
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

/** Makes one rendered item draggable through its root or an explicit VireoDragHandle. */
export const VireoDraggableItem = React.forwardRef<HTMLDivElement, VireoDraggableItemProps>(
  function VireoDraggableItem(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_DRAGGABLE_ITEM_NAME });
    const {
      allowDragFromInteractiveElements = false,
      disabled = false,
      disableDefaultFeedback = false,
      dragHandle = "root",
      id,
      index,
      respectForcePress = true,
      ...rootProps
    } = props;
    const context = React.useContext(VireoDndContext);
    if (!context) throw new Error("VireoDraggableItem must be used within VireoDndProvider.");
    const { registerDraggable } = context;
    const { capturePointerLift, getPointerLiftCorrection } = usePointerLiftCorrection();

    const encodedId = React.useMemo(() => encodeDndIdentifier(id, VIREO_DRAGGABLE_ITEM_NAME), [id]);
    React.useEffect(() => registerDraggable(encodedId), [encodedId, registerDraggable]);

    return (
      <Draggable
        draggableId={encodedId}
        index={index}
        isDragDisabled={disabled}
        disableInteractiveElementBlocking={allowDragFromInteractiveElements}
        shouldRespectForcePress={respectForcePress}
      >
        {(provided, snapshot) => (
          <RenderedDraggableItemRoot
            {...rootProps}
            disabled={disabled}
            disableDefaultFeedback={disableDefaultFeedback}
            dragHandle={dragHandle}
            forwardedRef={forwardedRef}
            liftCorrection={getPointerLiftCorrection(snapshot.isDragging)}
            onPointerLiftStart={capturePointerLift}
            provided={provided}
            snapshot={snapshot}
          />
        )}
      </Draggable>
    );
  },
);

VireoDraggableItem.displayName = VIREO_DRAGGABLE_ITEM_NAME;
