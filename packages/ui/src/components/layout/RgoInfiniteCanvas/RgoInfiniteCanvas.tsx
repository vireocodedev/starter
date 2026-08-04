import { RGO_INFINITE_CANVAS_BODY_CLASSNAME } from "@/components/layout/RgoInfiniteCanvas/components/RgoInfiniteCanvasBody/RgoInfiniteCanvasBody";
import { composeSx } from "@/utils/muiutils";
import { Box, type SxProps } from "@mui/material";
import React from "react";
import "./RgoInfiniteCanvas.css";

export type Point = { x: number; y: number };

export type Transform = { scale: number; pan: Point };

export type RgoInfiniteCanvasProps = {
  children?: React.ReactNode;
  initialScale?: number;
  initialPanX?: number;
  initialPanY?: number;
  minScale?: number;
  maxScale?: number;
  zoomStep?: number;
  horizontalGridFactor?: number;
  verticalGridFactor?: number;
  sx?: SxProps;
};

export type Rect = { id: string; left: number; top: number; width: number; height: number; background: string };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export type RgoInfiniteCanvasContext = {
  scale: number;
  pan: Point;
  minScale: number;
  maxScale: number;
  clientToWorld: (p: Point) => Point;
  worldToClient: (p: Point) => Point;
  getViewportCenterWorld: () => Point;
  setTransform: (scale: number, pan: Point) => void;
  target: HTMLDivElement;
  toggleFullscreen: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const RgoInfiniteCanvasContext = React.createContext<RgoInfiniteCanvasContext | null>(null);

export function RgoInfiniteCanvas({
  children,
  initialScale = 1,
  initialPanX = 0,
  initialPanY = 0,
  minScale = 0.1,
  maxScale = 10,
  zoomStep = 1.1,
  horizontalGridFactor = 1,
  verticalGridFactor = 2,
  sx,
}: RgoInfiniteCanvasProps) {
  const id = React.useId();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [t, setT] = React.useState<Transform>({ scale: initialScale, pan: { x: initialPanX, y: initialPanY } });
  const dragRef = React.useRef<{ active: boolean; last: Point } | null>(null);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;

      // If e.target doesn't have id id then return
      if (!(
        e.target instanceof HTMLElement &&
        (e.target.id === id || e.target.classList.contains(RGO_INFINITE_CANVAS_BODY_CLASSNAME))
      ))
        return;

      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      dragRef.current = { active: true, last: { x: e.clientX, y: e.clientY } };
    },
    [id],
  );

  const onPointerMove = React.useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d?.active) return;
    const dx = e.clientX - d.last.x;
    const dy = e.clientY - d.last.y;
    d.last = { x: e.clientX, y: e.clientY };
    setT(prev => ({ scale: prev.scale, pan: { x: prev.pan.x + dx, y: prev.pan.y + dy } }));
  }, []);

  const endDrag = React.useCallback(() => {
    const d = dragRef.current;
    if (d) d.active = false;
  }, []);

  const zoomTo = React.useCallback(
    (newScale: number, clientX: number, clientY: number) => {
      const c = containerRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      const clamped = clamp(newScale, minScale, maxScale);
      setT(prev => {
        const s0 = prev.scale;
        const p0 = prev.pan;
        const localX = clientX - rect.left;
        const localY = clientY - rect.top;
        const p1 = {
          x: localX - (clamped / s0) * (localX - p0.x),
          y: localY - (clamped / s0) * (localY - p0.y),
        };
        return { scale: clamped, pan: p1 };
      });
    },
    [minScale, maxScale],
  );

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      const direction = e.deltaY < 0 ? 1 : -1;
      const factor = direction > 0 ? zoomStep : 1 / zoomStep;
      zoomTo(t.scale * factor, e.clientX, e.clientY);
    };

    container.addEventListener("wheel", wheelHandler, { passive: false });

    return () => container.removeEventListener("wheel", wheelHandler);
  }, [t.scale, zoomStep, zoomTo]);

  const outerStyle = React.useMemo<React.CSSProperties>(() => {
    const base: React.CSSProperties = {
      position: "relative",
      overflow: "hidden",
      userSelect: "none",
      touchAction: "none",
      backgroundColor: "var(--mui-palette-grey-25)",
    };
    const spacing = Math.max(1, Math.round(24 * t.scale));
    const horizontalSpacing = spacing * horizontalGridFactor;
    const verticalSpacing = spacing * verticalGridFactor;
    const thickness = 1;
    const gridLineColor = "var(--mui-palette-grey-300)";

    const vertical = `linear-gradient(to right, ${gridLineColor} ${thickness}px, transparent ${thickness}px)`;
    const horizontal = `linear-gradient(to bottom, ${gridLineColor} ${thickness}px, transparent ${thickness}px)`;

    const offsetX = ((t.pan.x % horizontalSpacing) + horizontalSpacing) % horizontalSpacing;
    const offsetY = ((t.pan.y % verticalSpacing) + verticalSpacing) % verticalSpacing;

    return {
      ...base,
      backgroundImage: `${vertical}, ${horizontal}`,
      backgroundSize: `${horizontalSpacing}px 100%, 100% ${verticalSpacing}px`,
      backgroundPosition: `${Math.round(offsetX)}px 0px, 0px ${Math.round(offsetY)}px`,
    };
  }, [t.scale, t.pan.x, t.pan.y, horizontalGridFactor, verticalGridFactor]);

  const clientToWorld = React.useCallback(
    (client: Point): Point => {
      const c = containerRef.current;
      if (!c) return client;
      const rect = c.getBoundingClientRect();
      const local = { x: client.x - rect.left, y: client.y - rect.top };
      return { x: (local.x - t.pan.x) / t.scale, y: (local.y - t.pan.y) / t.scale };
    },
    [t.pan.x, t.pan.y, t.scale],
  );

  const worldToClient = React.useCallback(
    (world: Point): Point => {
      const c = containerRef.current;
      if (!c) return world;
      const rect = c.getBoundingClientRect();
      const local = { x: t.pan.x + world.x * t.scale, y: t.pan.y + world.y * t.scale };
      return { x: rect.left + local.x, y: rect.top + local.y };
    },
    [t.pan.x, t.pan.y, t.scale],
  );

  const getViewportCenterWorld = React.useCallback((): Point => {
    const c = containerRef.current;
    if (!c) return { x: 0, y: 0 };
    const rect = c.getBoundingClientRect();
    const local = { x: rect.width / 2, y: rect.height / 2 };
    return { x: (local.x - t.pan.x) / t.scale, y: (local.y - t.pan.y) / t.scale };
  }, [t.pan.x, t.pan.y, t.scale]);

  const setTransform = React.useCallback(
    (scale: number, pan: Point) => {
      const clampedScale = clamp(scale, minScale, maxScale);
      setT({ scale: clampedScale, pan });
    },
    [minScale, maxScale],
  );

  const toggleFullscreen = React.useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  return (
    <Box
      ref={containerRef}
      style={outerStyle}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      id={id}
      sx={composeSx(sx, {
        width: "100%",
        height: "100%",
        outline: "1px solid var(--mui-palette-grey-300)",
      })}
    >
      <RgoInfiniteCanvasContext.Provider
        value={{
          scale: t.scale,
          pan: t.pan,
          minScale,
          maxScale,
          clientToWorld,
          worldToClient,
          getViewportCenterWorld,
          setTransform,
          target: containerRef.current!,
          toggleFullscreen,
        }}
      >
        {children}
      </RgoInfiniteCanvasContext.Provider>
    </Box>
  );
}
