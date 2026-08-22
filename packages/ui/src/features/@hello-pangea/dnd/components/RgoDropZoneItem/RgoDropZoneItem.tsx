import { useDropZone } from "@/features/@hello-pangea/dnd/hooks/useDropZone";
import { type RgoDraggableId } from "@/features/@hello-pangea/dnd/models/RgoDraggableId";
import { jsonCrushEncode } from "@/core/utils/tsutils";
import { Draggable, type DraggableStateSnapshot } from "@hello-pangea/dnd";
import { Box, type BoxProps } from "@mui/material";
import React from "react";
import "./RgoDropZoneItem.css";

export type RgoDropZoneItemProps = {
  id: RgoDraggableId;
  index: number;
  sx?: BoxProps["sx"];
  children?: React.ReactNode;
};

export function RgoDropZoneItem({ id, index, sx, children }: RgoDropZoneItemProps) {
  const { draggingId, dropVisibilityDuration } = useDropZone();
  const draggableId = jsonCrushEncode<RgoDraggableId>(id);

  const getCardStyle = (
    providedStyle: React.CSSProperties | undefined,
    snapshot: DraggableStateSnapshot,
  ): React.CSSProperties | undefined => {
    // Override drop animation: keep card at release position, then fade out
    if (snapshot.isDropAnimating && dropVisibilityDuration != null) {
      const delaySec = dropVisibilityDuration / 1000;
      return {
        ...providedStyle,
        transition: `transform 0.001s ease ${delaySec}s, opacity 0.001s ease ${delaySec}s`,
        opacity: 0,
      };
    }

    // Prevent other items from shifting during drag
    if (draggingId && draggingId !== draggableId) {
      return {
        ...providedStyle,
        transform: "none !important",
      };
    }

    return providedStyle;
  };

  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tabIndex: _tabIndex, ...dragHandlePropsWithoutTabIndex } = provided.dragHandleProps ?? {};
        return (
          <Box
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...dragHandlePropsWithoutTabIndex}
            tabIndex={-1}
            style={getCardStyle(provided.draggableProps.style, snapshot)}
            sx={sx}
          >
            {children}
          </Box>
        );
      }}
    </Draggable>
  );
}
