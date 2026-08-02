import { useRgoInfiniteCanvas } from "@/hooks/useRgoInfiniteCanvas/useRgoInfiniteCanvas";
import React from "react";
import "./RgoInfiniteCanvasBody.css";

export type RgoInfiniteCanvasBodyProps = {
  children: React.ReactNode;
};

export const RGO_INFINITE_CANVAS_BODY_CLASSNAME = "rgo-infinite-canvas-body";

export function RgoInfiniteCanvasBody({ children }: RgoInfiniteCanvasBodyProps) {
  const {
    scale,
    pan: { x: panX, y: panY },
  } = useRgoInfiniteCanvas();

  const innerStyle = React.useMemo<React.CSSProperties>(
    () => ({
      transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
      transformOrigin: "0 0",
      position: "absolute",
      inset: 0,
      willChange: "transform",
    }),
    [panX, panY, scale],
  );

  return (
    <div className={RGO_INFINITE_CANVAS_BODY_CLASSNAME} style={innerStyle}>
      {children}
    </div>
  );
}
