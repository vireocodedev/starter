import { Box } from "@mui/material";
import React from "react";
import "./RgoInfiniteCanvasOverlay.css";

const OVERLAY_SX_BY_POSITION = {
  "top-left": { top: 16, left: 16 },
  top: { top: 16, left: "50%", transform: "translateX(-50%)" },
  "top-right": { top: 16, right: 16 },
  right: { top: "50%", right: 16, transform: "translateY(-50%)" },
  "bottom-right": { bottom: 16, right: 16 },
  bottom: { bottom: 16, left: "50%", transform: "translateX(-50%)" },
  "bottom-left": { bottom: 16, left: 16 },
  left: { top: "50%", left: 16, transform: "translateY(-50%)" },
};

export type RgoInfiniteCanvasOverlayPosition = keyof typeof OVERLAY_SX_BY_POSITION;

export type RgoInfiniteCanvasOverlayProps = {
  position?: RgoInfiniteCanvasOverlayPosition;
  children: React.ReactNode;
};

const DEFAULT_OVERLAY_POSITION: RgoInfiniteCanvasOverlayPosition = "top-right";

export function RgoInfiniteCanvasOverlay({
  position = DEFAULT_OVERLAY_POSITION,
  children,
}: RgoInfiniteCanvasOverlayProps) {
  const overlaySx = React.useMemo(() => {
    const normalizedPosition = position || DEFAULT_OVERLAY_POSITION;
    return OVERLAY_SX_BY_POSITION[normalizedPosition];
  }, [position]);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <Box sx={{ position: "absolute", pointerEvents: "auto", ...overlaySx }} onPointerDown={e => e.stopPropagation()}>
        {children}
      </Box>
    </div>
  );
}
