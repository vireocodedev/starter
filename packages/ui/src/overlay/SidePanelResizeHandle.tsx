import {
  SIDE_PANEL_RESIZE_ACTIVE_OPACITY,
  SIDE_PANEL_RESIZE_HANDLE_WIDTH,
  SIDE_PANEL_RESIZE_HITBOX_WIDTH,
  SIDE_PANEL_RESIZE_HOVER_OPACITY,
} from "./overlay.constants";
import { Box } from "@mui/material";
import React from "react";

export function SidePanelResizeHandle({
  enabled,
  isResizing,
  onResizeStart,
  onResizeDoubleClick,
}: {
  enabled: boolean;
  isResizing: boolean;
  onResizeStart: (event: React.MouseEvent<HTMLDivElement>) => void;
  onResizeDoubleClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const [isResizeHovered, setIsResizeHovered] = React.useState(false);

  if (!enabled) {
    return null;
  }

  return (
    <Box
      onMouseDown={onResizeStart}
      onDoubleClick={onResizeDoubleClick}
      onMouseEnter={() => setIsResizeHovered(true)}
      onMouseLeave={() => setIsResizeHovered(false)}
      role="presentation"
      sx={theme => ({
        position: "absolute",
        top: 0,
        left: 0,
        width: SIDE_PANEL_RESIZE_HITBOX_WIDTH,
        height: "100%",
        cursor: "col-resize",
        zIndex: 1300,
        backgroundColor: "transparent",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: SIDE_PANEL_RESIZE_HANDLE_WIDTH,
          height: "100%",
          backgroundColor:
            isResizing || isResizeHovered
              ? theme.palette.mode === "light"
                ? theme.palette.grey[500]
                : theme.palette.grey[400]
              : "transparent",
          opacity: isResizing
            ? SIDE_PANEL_RESIZE_ACTIVE_OPACITY
            : isResizeHovered
              ? SIDE_PANEL_RESIZE_HOVER_OPACITY
              : 0,
        },
        transition: theme.transitions.create(["opacity", "background-color"], {
          duration: theme.transitions.duration.shortest,
        }),
      })}
    />
  );
}
