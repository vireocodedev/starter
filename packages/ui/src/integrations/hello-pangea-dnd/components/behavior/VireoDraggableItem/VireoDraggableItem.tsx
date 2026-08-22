"use client";

import { VireoDndContext } from "@/integrations/hello-pangea-dnd/contexts/VireoDndContext/VireoDndContext";
import { encodeDndIdentifier } from "@/integrations/hello-pangea-dnd/utils/dndIdCodec";
import { DraggableItemRoot } from "@/integrations/hello-pangea-dnd/components/behavior/VireoDraggableItem/internal/components/DraggableItemRoot";
import { Draggable } from "@hello-pangea/dnd";
import { useThemeProps } from "@mui/material/styles";
import React from "react";
import { VIREO_DRAGGABLE_ITEM_NAME } from "./VireoDraggableItem.identity";
import type { VireoDraggableItemProps } from "./VireoDraggableItem.types";

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
          <DraggableItemRoot
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
