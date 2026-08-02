import { type RgoDraggableId } from "@/features/@hello-pangea/dnd/models/RgoDraggableId";
import { type RgoDroppableId } from "@/features/@hello-pangea/dnd/models/RgoDroppableId";
import { type RgoProvider } from "@/providers/RgoProviders";
import { jsonCrushDecode } from "@/utils/tsutils";
import type { DragStart, DragUpdate, DropResult, ResponderProvided } from "@hello-pangea/dnd";
import { DragDropContext } from "@hello-pangea/dnd";
import React from "react";

export type RgoDropZoneState = {
  isDragging: boolean;
  draggingId: string | null;
  sourceId: string | null;
};

export type RgoDropZoneDropProposal = {
  source: RgoDroppableId;
  destination: RgoDroppableId;
  draggable: RgoDraggableId;
};

export type RgoDropZoneProviderProps = {
  onDragStart?: (start: DragStart, provided: ResponderProvided) => void;
  onDragEnd: (proposal: RgoDropZoneDropProposal, emitResponse?: boolean) => boolean;
  /** Milliseconds after mouse release to fire the response callback. When set, the response
   *  is triggered early (before the drop animation finishes) using a pointerup listener. */
  dropResponseDelay?: number;
  /** Milliseconds the dropped item stays visible at the release position before disappearing.
   *  When set, the library's fly-to-destination animation is disabled.
   *  0 = card disappears instantly at release position. >0 = card hovers for that duration then fades. */
  dropVisibilityDuration?: number;
};

export type RgoDropZoneContext = RgoDropZoneState & {
  onDragEnd: RgoDropZoneProviderProps["onDragEnd"];
  dropVisibilityDuration?: number;
};

// eslint-disable-next-line react-refresh/only-export-components
export const RgoDropZoneContext = React.createContext<RgoDropZoneContext | undefined>(undefined);

export const RgoDropZoneProvider: RgoProvider<RgoDropZoneProviderProps> = ({
  onDragStart,
  onDragEnd,
  dropResponseDelay,
  dropVisibilityDuration,
  children,
}) => {
  const [dragState, setDragState] = React.useState<RgoDropZoneState>({
    isDragging: false,
    draggingId: null,
    sourceId: null,
  });

  // Refs for early-response tracking
  const lastDestinationRef = React.useRef<string | null>(null);
  const lastSourceRef = React.useRef<string | null>(null);
  const lastDraggableRef = React.useRef<string | null>(null);
  const responseEmittedRef = React.useRef(false);
  const earlyResponseEnabled = dropResponseDelay != null;

  // Keep onDragEnd in a ref so the pointerup listener always sees the latest callback
  const onDragEndRef = React.useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  const handleDragStart = React.useCallback(
    (start: DragStart, provided: ResponderProvided) => {
      responseEmittedRef.current = false;
      lastSourceRef.current = start.source.droppableId;
      lastDraggableRef.current = start.draggableId;
      lastDestinationRef.current = null;

      setDragState({
        isDragging: true,
        draggingId: start.draggableId,
        sourceId: start.source.droppableId,
      });

      if (onDragStart) {
        onDragStart(start, provided);
      }
    },
    [onDragStart],
  );

  const handleDragUpdate = React.useCallback((update: DragUpdate) => {
    lastDestinationRef.current = update.destination?.droppableId ?? null;
  }, []);

  // Listen for pointerup during drag to fire the response early
  React.useEffect(() => {
    if (!dragState.isDragging || !earlyResponseEnabled) return;

    const handlePointerUp = () => {
      const destinationId = lastDestinationRef.current;
      const sourceId = lastSourceRef.current;
      const draggableId = lastDraggableRef.current;

      if (!destinationId || !sourceId || !draggableId) return;

      const timer = setTimeout(() => {
        if (!responseEmittedRef.current) {
          responseEmittedRef.current = true;
          onDragEndRef.current(
            {
              source: jsonCrushDecode<RgoDroppableId>(sourceId),
              destination: jsonCrushDecode<RgoDroppableId>(destinationId),
              draggable: jsonCrushDecode<RgoDraggableId>(draggableId),
            },
            true,
          );
        }
      }, dropResponseDelay);

      return () => clearTimeout(timer);
    };

    window.addEventListener("pointerup", handlePointerUp, { once: true });
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [dragState.isDragging, earlyResponseEnabled, dropResponseDelay]);

  const handleDragEnd = React.useCallback(
    (result: DropResult) => {
      setDragState({
        isDragging: false,
        draggingId: null,
        sourceId: null,
      });

      if (onDragEnd && result.destination && !responseEmittedRef.current) {
        responseEmittedRef.current = true;
        onDragEnd(
          {
            source: jsonCrushDecode<RgoDroppableId>(result.source.droppableId),
            destination: jsonCrushDecode<RgoDroppableId>(result.destination.droppableId),
            draggable: jsonCrushDecode<RgoDraggableId>(result.draggableId),
          },
          true,
        );
      }
    },
    [onDragEnd],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragUpdate={handleDragUpdate} onDragEnd={handleDragEnd}>
      <RgoDropZoneContext.Provider value={{ ...dragState, onDragEnd, dropVisibilityDuration }}>
        {children}
      </RgoDropZoneContext.Provider>
    </DragDropContext>
  );
};
