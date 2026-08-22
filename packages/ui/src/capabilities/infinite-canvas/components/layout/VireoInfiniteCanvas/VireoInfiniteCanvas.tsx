import { VireoInfiniteCanvasContext } from "@/capabilities/infinite-canvas/contexts/VireoInfiniteCanvasContext/VireoInfiniteCanvasContext";
import type { VireoCanvasPoint, VireoCanvasTransform } from "@/capabilities/infinite-canvas/types/infiniteCanvas.types";
import {
  clampCanvasScale,
  normalizeCanvasTransform,
  zoomCanvasAtPoint,
} from "@/capabilities/infinite-canvas/utils/infiniteCanvas.utils";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps, useVireoFullscreen } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoInfiniteCanvasClassKey, getVireoInfiniteCanvasUtilityClass } from "./VireoInfiniteCanvas.classes";
import { VIREO_INFINITE_CANVAS_NAME, type VireoInfiniteCanvasSlotName } from "./VireoInfiniteCanvas.identity";
import { VireoInfiniteCanvasRoot } from "./VireoInfiniteCanvas.styled";
import type { VireoInfiniteCanvasOwnerState, VireoInfiniteCanvasProps } from "./VireoInfiniteCanvas.types";

const DEFAULT_TRANSFORM: VireoCanvasTransform = { scale: 1, pan: { x: 0, y: 0 } };
function useUtilityClasses(classes?: VireoInfiniteCanvasProps["classes"]) {
  return composeClasses(
    { root: ["root"] } as const satisfies UtilityClassSlotMap<VireoInfiniteCanvasSlotName, VireoInfiniteCanvasClassKey>,
    getVireoInfiniteCanvasUtilityClass,
    classes,
  );
}

/** Provides a controlled-or-uncontrolled pannable, zoomable world coordinate surface. */
export const VireoInfiniteCanvas = React.forwardRef<HTMLDivElement, VireoInfiniteCanvasProps>(
  function VireoInfiniteCanvas(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_INFINITE_CANVAS_NAME });
    const {
      children,
      className,
      classes: classesProp,
      defaultTransform = DEFAULT_TRANSFORM,
      gridSize = 24,
      horizontalGridFactor = 1,
      maxScale = 10,
      minScale = 0.1,
      onTransformChange,
      panEnabled = true,
      slotProps = {},
      slots = {},
      style,
      sx,
      transform: controlledTransform,
      verticalGridFactor = 1,
      wheelZoomEnabled = true,
      zoomStep = 1.1,
      ...other
    } = props;
    const initialTransform = React.useRef(normalizeCanvasTransform(defaultTransform, minScale, maxScale));
    const [internalTransform, setInternalTransform] = React.useState(initialTransform.current);
    const transform = normalizeCanvasTransform(controlledTransform ?? internalTransform, minScale, maxScale);
    const [target, setTarget] = React.useState<HTMLDivElement | null>(null);
    const { isFullscreen, isSupported: isFullscreenSupported, toggleFullscreen } = useVireoFullscreen(target);
    const [panning, setPanning] = React.useState(false);
    const dragRef = React.useRef<VireoCanvasPoint | null>(null);
    const ownerState: VireoInfiniteCanvasOwnerState = {
      transform,
      gridSize,
      horizontalGridFactor,
      verticalGridFactor,
      panning,
    };
    const classes = useUtilityClasses(classesProp);
    const root = resolveSlotProps(slotProps.root, ownerState);
    const ref = useForkRef(forwardedRef, root.ref, setTarget);
    const setTransform = React.useCallback(
      (next: VireoCanvasTransform) => {
        const normalized = normalizeCanvasTransform(next, minScale, maxScale);
        if (controlledTransform == null) setInternalTransform(normalized);
        onTransformChange?.(normalized);
      },
      [controlledTransform, maxScale, minScale, onTransformChange],
    );
    const zoomAtClient = React.useCallback(
      (scale: number, client: VireoCanvasPoint) => {
        if (!target) return;
        const rect = target.getBoundingClientRect();
        const local = { x: client.x - rect.left, y: client.y - rect.top };
        setTransform(zoomCanvasAtPoint(transform, clampCanvasScale(scale, minScale, maxScale), local));
      },
      [maxScale, minScale, setTransform, target, transform],
    );
    React.useEffect(() => {
      if (!target || !wheelZoomEnabled) return;
      const handler = (event: WheelEvent) => {
        event.preventDefault();
        zoomAtClient(transform.scale * (event.deltaY < 0 ? zoomStep : 1 / zoomStep), {
          x: event.clientX,
          y: event.clientY,
        });
      };
      target.addEventListener("wheel", handler, { passive: false });
      return () => target.removeEventListener("wheel", handler);
    }, [target, transform.scale, wheelZoomEnabled, zoomAtClient, zoomStep]);
    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!panEnabled || event.button !== 0) return;
      const eventTarget = event.target as HTMLElement;
      if (eventTarget !== event.currentTarget && !eventTarget.hasAttribute("data-vireo-canvas-pan-surface")) return;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      dragRef.current = { x: event.clientX, y: event.clientY };
      setPanning(true);
    };
    const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      const previous = dragRef.current;
      dragRef.current = { x: event.clientX, y: event.clientY };
      setTransform({
        scale: transform.scale,
        pan: { x: transform.pan.x + event.clientX - previous.x, y: transform.pan.y + event.clientY - previous.y },
      });
    };
    const endPan = () => {
      dragRef.current = null;
      setPanning(false);
    };
    const clientToWorld = React.useCallback(
      (point: VireoCanvasPoint) => {
        if (!target) return point;
        const rect = target.getBoundingClientRect();
        return {
          x: (point.x - rect.left - transform.pan.x) / transform.scale,
          y: (point.y - rect.top - transform.pan.y) / transform.scale,
        };
      },
      [target, transform],
    );
    const worldToClient = React.useCallback(
      (point: VireoCanvasPoint) => {
        if (!target) return point;
        const rect = target.getBoundingClientRect();
        return {
          x: rect.left + transform.pan.x + point.x * transform.scale,
          y: rect.top + transform.pan.y + point.y * transform.scale,
        };
      },
      [target, transform],
    );
    const getViewportCenterWorld = React.useCallback(() => {
      if (!target) return { x: 0, y: 0 };
      const rect = target.getBoundingClientRect();
      return {
        x: (rect.width / 2 - transform.pan.x) / transform.scale,
        y: (rect.height / 2 - transform.pan.y) / transform.scale,
      };
    }, [target, transform]);
    const zoomFromCenter = React.useCallback(
      (factor: number) => {
        if (!target) return;
        const rect = target.getBoundingClientRect();
        zoomAtClient(transform.scale * factor, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      },
      [target, transform.scale, zoomAtClient],
    );
    const context = React.useMemo(
      () => ({
        transform,
        scale: transform.scale,
        pan: transform.pan,
        minScale,
        maxScale,
        target,
        clientToWorld,
        worldToClient,
        getViewportCenterWorld,
        setTransform,
        resetTransform: () => setTransform(initialTransform.current),
        zoomIn: () => zoomFromCenter(zoomStep),
        zoomOut: () => zoomFromCenter(1 / zoomStep),
        isFullscreen,
        isFullscreenSupported,
        toggleFullscreen,
      }),
      [
        clientToWorld,
        getViewportCenterWorld,
        isFullscreen,
        isFullscreenSupported,
        maxScale,
        minScale,
        setTransform,
        target,
        toggleFullscreen,
        transform,
        worldToClient,
        zoomFromCenter,
        zoomStep,
      ],
    );
    return (
      <VireoInfiniteCanvasContext.Provider value={context}>
        <VireoInfiniteCanvasRoot
          {...other}
          {...root}
          as={slots.root ?? "div"}
          ref={ref}
          ownerState={ownerState}
          data-vireo-canvas-pan-surface=""
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPan}
          onPointerCancel={endPan}
          className={joinClassNames(classes.root, className, root.className)}
          style={{ ...style, ...root.style }}
          sx={mergeSx(sx, root.sx)}
        >
          {children}
        </VireoInfiniteCanvasRoot>
      </VireoInfiniteCanvasContext.Provider>
    );
  },
);
VireoInfiniteCanvas.displayName = VIREO_INFINITE_CANVAS_NAME;
