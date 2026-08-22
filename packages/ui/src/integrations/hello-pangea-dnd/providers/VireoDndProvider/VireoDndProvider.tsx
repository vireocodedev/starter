"use client";

import {
  VireoDndContext,
  type VireoDndZoneRegistration,
} from "@/integrations/hello-pangea-dnd/contexts/VireoDndContext/VireoDndContext";
import type {
  VireoDndDragStart,
  VireoDndDragUpdate,
  VireoDndProviderProps,
  VireoDndState,
  VireoDraggableId,
  VireoDropZoneId,
} from "@/integrations/hello-pangea-dnd/types/dnd.types";
import { decodeDndIdentifier } from "@/integrations/hello-pangea-dnd/utils/dndIdCodec";
import { DragDropContext } from "@hello-pangea/dnd";
import type { BeforeCapture, DragStart, DragUpdate, DropResult } from "@hello-pangea/dnd";
import React from "react";

const IDLE_STATE: VireoDndState = { isDragging: false, active: null, destination: null };

function decodeStart(start: DragStart): VireoDndDragStart {
  return {
    draggable: decodeDndIdentifier<VireoDraggableId>(start.draggableId),
    source: {
      id: decodeDndIdentifier<VireoDropZoneId>(start.source.droppableId),
      index: start.source.index,
    },
  };
}

/** Provides one isolated, typed Hello Pangea drag-and-drop lifecycle. */
export function VireoDndProvider({
  children,
  onBeforeCapture,
  onBeforeDragStart,
  onDragStart,
  onDragUpdate,
  onDragEnd,
  ...nativeOptions
}: VireoDndProviderProps) {
  const parentContext = React.useContext(VireoDndContext);
  if (parentContext) throw new Error("VireoDndProvider instances cannot be nested.");

  const [state, setState] = React.useState<VireoDndState>(IDLE_STATE);
  const zonesRef = React.useRef(new Map<string, VireoDndZoneRegistration>());
  const draggableCountsRef = React.useRef(new Map<string, number>());

  const registerZone = React.useCallback((encodedId: string, registration: VireoDndZoneRegistration) => {
    if (process.env.NODE_ENV !== "production" && zonesRef.current.has(encodedId)) {
      console.warn("VireoDndProvider received duplicate VireoDropZone identifiers.");
    }
    zonesRef.current.set(encodedId, registration);
    return () => {
      if (zonesRef.current.get(encodedId) === registration) zonesRef.current.delete(encodedId);
    };
  }, []);

  const registerDraggable = React.useCallback((encodedId: string) => {
    const nextCount = (draggableCountsRef.current.get(encodedId) ?? 0) + 1;
    draggableCountsRef.current.set(encodedId, nextCount);
    if (process.env.NODE_ENV !== "production" && nextCount > 1) {
      console.warn("VireoDndProvider received duplicate VireoDraggableItem identifiers.");
    }
    return () => {
      const remaining = (draggableCountsRef.current.get(encodedId) ?? 1) - 1;
      if (remaining <= 0) draggableCountsRef.current.delete(encodedId);
      else draggableCountsRef.current.set(encodedId, remaining);
    };
  }, []);

  const getZone = React.useCallback((encodedId: string) => zonesRef.current.get(encodedId), []);

  const handleBeforeCapture = React.useCallback(
    (capture: BeforeCapture) => onBeforeCapture?.({ draggable: decodeDndIdentifier(capture.draggableId) }),
    [onBeforeCapture],
  );

  const handleBeforeDragStart = React.useCallback(
    (start: DragStart) => onBeforeDragStart?.(decodeStart(start)),
    [onBeforeDragStart],
  );

  const handleDragStart = React.useCallback(
    (start: DragStart, provided: { announce: (message: string) => void }) => {
      const decoded = decodeStart(start);
      setState({ isDragging: true, active: decoded, destination: null });
      onDragStart?.(decoded, provided);
    },
    [onDragStart],
  );

  const decodeUpdate = React.useCallback(
    (update: DragUpdate): VireoDndDragUpdate => {
      const start = decodeStart(update);
      const zone = update.destination ? getZone(update.destination.droppableId) : undefined;
      return {
        ...start,
        destination:
          update.destination && zone ? { id: zone.id, index: update.destination.index, mode: zone.mode } : null,
      };
    },
    [getZone],
  );

  const handleDragUpdate = React.useCallback(
    (update: DragUpdate, provided: { announce: (message: string) => void }) => {
      const decoded = decodeUpdate(update);
      const destinationZone = update.destination ? getZone(update.destination.droppableId) : undefined;
      const sourceZone = getZone(update.source.droppableId);
      const accepted = Boolean(
        decoded.destination &&
        destinationZone &&
        !destinationZone.disabled &&
        sourceZone?.group === destinationZone.group &&
        (destinationZone.canDrop?.({
          draggable: decoded.draggable,
          source: decoded.source,
          destination: {
            id: destinationZone.id,
            mode: destinationZone.mode,
            group: destinationZone.group,
          },
        }) ??
          true),
      );
      setState(current => ({
        isDragging: true,
        active: current.active ?? { draggable: decoded.draggable, source: decoded.source },
        destination: decoded.destination ? { ...decoded.destination, accepted } : null,
      }));
      onDragUpdate?.(decoded, provided);
    },
    [decodeUpdate, getZone, onDragUpdate],
  );

  const handleDragEnd = React.useCallback(
    (result: DropResult, provided: { announce: (message: string) => void }) => {
      const decoded = decodeUpdate(result);
      setState(IDLE_STATE);
      onDragEnd(
        {
          ...decoded,
          reason: result.reason === "CANCEL" || decoded.destination === null ? "cancel" : "drop",
        },
        provided,
      );
    },
    [decodeUpdate, onDragEnd],
  );

  const value = React.useMemo(
    () => ({ ...state, getZone, registerDraggable, registerZone }),
    [getZone, registerDraggable, registerZone, state],
  );

  return (
    <DragDropContext
      {...nativeOptions}
      onBeforeCapture={handleBeforeCapture}
      onBeforeDragStart={handleBeforeDragStart}
      onDragStart={handleDragStart}
      onDragUpdate={handleDragUpdate}
      onDragEnd={handleDragEnd}
    >
      <VireoDndContext.Provider value={value}>{children}</VireoDndContext.Provider>
    </DragDropContext>
  );
}
