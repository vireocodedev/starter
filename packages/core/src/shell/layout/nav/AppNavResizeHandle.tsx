import {
  NAV_RESIZE_ACTIVE_OPACITY,
  NAV_RESIZE_HANDLE_WIDTH,
  NAV_RESIZE_HITBOX_WIDTH,
  NAV_RESIZE_HOVER_OPACITY,
} from "@/shell/layout/layoutNav.constants";
import { Box } from "@mui/material";
import React from "react";

export function AppNavResizeHandle({
  isResizing,
  navLocked,
  onResizeDoubleClick,
  onResizeStart,
}: {
  isResizing: boolean;
  navLocked: boolean;
  onResizeDoubleClick?: () => void;
  onResizeStart?: (event: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const [isResizeHovered, setIsResizeHovered] = React.useState(false);

  if (navLocked) {
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
        right: 0,
        width: NAV_RESIZE_HITBOX_WIDTH,
        height: "100%",
        cursor: "col-resize",
        zIndex: 1300,
        backgroundColor: "transparent",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: NAV_RESIZE_HANDLE_WIDTH,
          height: "100%",
          backgroundColor:
            isResizing || isResizeHovered
              ? theme.palette.mode === "light"
                ? theme.palette.grey[500]
                : theme.palette.grey[400]
              : "transparent",
          opacity: isResizing ? NAV_RESIZE_ACTIVE_OPACITY : isResizeHovered ? NAV_RESIZE_HOVER_OPACITY : 0,
        },
        transition: theme.transitions.create(["opacity", "background-color"], {
          duration: theme.transitions.duration.shortest,
        }),
      })}
    />
  );
}
