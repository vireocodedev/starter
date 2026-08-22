import { useDropZone } from "@/features/@hello-pangea/dnd/hooks/useDropZone";
import { type RgoDraggableId } from "@/features/@hello-pangea/dnd/models/RgoDraggableId";
import { type RgoDroppableId } from "@/features/@hello-pangea/dnd/models/RgoDroppableId";
import { jsonCrushDecode, jsonCrushEncode } from "@/core/utils/tsutils";
import { Droppable, type DroppableStateSnapshot } from "@hello-pangea/dnd";
import { Box } from "@mui/material";
import React from "react";
import "./RgoDropZone.css";

export type RgoDropZoneProps = {
  droppableId: RgoDroppableId;
  children: React.ReactNode;
  className?: string;
  dropZoneRef?: React.MutableRefObject<HTMLDivElement | null>;
  dropZoneScrollable?: boolean;
  enablePlaceholder?: boolean;
};

export function RgoDropZone({
  children,
  dropZoneRef,
  className,
  dropZoneScrollable = false,
  droppableId,
  enablePlaceholder = false,
}: RgoDropZoneProps) {
  const { draggingId, isDragging, sourceId, onDragEnd } = useDropZone();
  const fixedHeight = !dropZoneScrollable;
  const dropZoneCssBorder = "3px solid var(--mui-palette-grey-900)";
  const dropZoneCssBorderDashed = "3px dashed var(--mui-palette-primary-900)";

  const encodedDroppableId = jsonCrushEncode<RgoDroppableId>(droppableId);

  // Determine if this dropzone should show the border when dragging
  const shouldShowDropzoneBorder = React.useMemo(() => {
    if (!isDragging) {
      return false;
    }

    // Default logic: Check if we're dragging from the same dropzone (prevent dropping on self)
    if (sourceId === encodedDroppableId) {
      return false;
    }

    return onDragEnd(
      {
        source: jsonCrushDecode<RgoDroppableId>(sourceId!),
        destination: jsonCrushDecode<RgoDroppableId>(encodedDroppableId),
        draggable: jsonCrushDecode<RgoDraggableId>(draggingId!),
      },
      false,
    );
  }, [encodedDroppableId, draggingId, isDragging, onDragEnd, sourceId]);

  const borderStyle = shouldShowDropzoneBorder
    ? (snapshot: DroppableStateSnapshot) => (snapshot.isDraggingOver ? dropZoneCssBorder : dropZoneCssBorderDashed)
    : () => undefined;

  const overlayBackground = shouldShowDropzoneBorder
    ? (snapshot: DroppableStateSnapshot) =>
        snapshot.isDraggingOver ? "color-mix(in srgb, var(--mui-palette-primary-400) 20%, transparent)" : undefined
    : () => undefined;

  return (
    <Droppable droppableId={encodedDroppableId}>
      {(provided, snapshot) => (
        <Box
          ref={(el: HTMLDivElement | null) => {
            provided.innerRef(el);

            if (dropZoneRef && typeof dropZoneRef === "object" && "current" in dropZoneRef) {
              (dropZoneRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            }
          }}
          {...provided.droppableProps}
          className={className}
          sx={{
            overflow: shouldShowDropzoneBorder && dropZoneScrollable ? "hidden !important" : undefined,
            borderRadius: shouldShowDropzoneBorder ? "8px" : undefined,
            zIndex: shouldShowDropzoneBorder ? 1 : undefined,
            outline: dropZoneScrollable ? borderStyle(snapshot) : undefined,
            outlineOffset: dropZoneScrollable && shouldShowDropzoneBorder ? "-3px" : undefined,
            "::after": shouldShowDropzoneBorder
              ? {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  ...(fixedHeight ? { bottom: 0 } : { height: "99999px" }),
                  pointerEvents: "none",
                  boxSizing: "border-box",
                  background: overlayBackground(snapshot),
                  border: fixedHeight ? borderStyle(snapshot) : undefined,
                }
              : undefined,
          }}
        >
          {children}
          {enablePlaceholder && provided.placeholder}
        </Box>
      )}
    </Droppable>
  );
}
