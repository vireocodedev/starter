import {
  SIDE_PANEL_RESIZE_KEYBOARD_STEP,
  SIDE_PANEL_WIDTH_CSS_VAR,
} from "@/capabilities/overlays/constants/overlay.constants";
import { clampSidePanelWidth } from "@/capabilities/overlays/utils/overlay.utils";
import React from "react";

export function useSidePanelResize({
  enabled,
  initialWidth,
  minWidth,
  maxWidth,
}: {
  enabled: boolean;
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
}) {
  const [width, setWidth] = React.useState(() => clampSidePanelWidth(initialWidth, minWidth, maxWidth));
  const [isResizing, setIsResizing] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const widthRef = React.useRef(width);
  const initialWidthRef = React.useRef(initialWidth);
  const minWidthRef = React.useRef(minWidth);
  const maxWidthRef = React.useRef(maxWidth);
  const hasUserResizedRef = React.useRef(false);
  const resizeRafRef = React.useRef<number | null>(null);
  const pendingWidthRef = React.useRef<number | null>(null);
  const cleanupResizeRef = React.useRef<(() => void) | null>(null);

  const setCssWidth = React.useCallback((nextWidth: number) => {
    rootRef.current?.style.setProperty(SIDE_PANEL_WIDTH_CSS_VAR, `${nextWidth}px`);
  }, []);

  const setRootElement = React.useCallback((element: HTMLDivElement | null) => {
    rootRef.current = element;

    if (element) {
      element.style.setProperty(SIDE_PANEL_WIDTH_CSS_VAR, `${widthRef.current}px`);
    }
  }, []);

  React.useEffect(() => {
    initialWidthRef.current = initialWidth;
    minWidthRef.current = minWidth;
    maxWidthRef.current = maxWidth;

    const nextWidth = clampSidePanelWidth(
      hasUserResizedRef.current ? widthRef.current : initialWidth,
      minWidth,
      maxWidth,
    );

    if (nextWidth !== widthRef.current) {
      widthRef.current = nextWidth;
      setWidth(nextWidth);
    }

    setCssWidth(nextWidth);
  }, [initialWidth, maxWidth, minWidth, setCssWidth]);

  React.useEffect(() => {
    return () => {
      cleanupResizeRef.current?.();
      if (resizeRafRef.current !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
    };
  }, []);

  const commitWidth = React.useCallback(
    (candidate: number, userResized = true) => {
      const nextWidth = clampSidePanelWidth(candidate, minWidthRef.current, maxWidthRef.current);
      pendingWidthRef.current = null;
      widthRef.current = nextWidth;
      hasUserResizedRef.current = userResized;
      setCssWidth(nextWidth);
      setWidth(nextWidth);
    },
    [setCssWidth],
  );

  const onResizeStart = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled || typeof window === "undefined") {
        return;
      }

      if (event.detail > 1) {
        return;
      }

      event.preventDefault();

      const startX = event.clientX;
      const startWidth = widthRef.current;
      const previousBodyCursor = document.body.style.cursor;
      const previousBodyUserSelect = document.body.style.userSelect;

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      pendingWidthRef.current = null;
      setIsResizing(true);

      const syncPendingWidth = () => {
        resizeRafRef.current = null;

        if (pendingWidthRef.current === null) {
          return;
        }

        widthRef.current = pendingWidthRef.current;
        setCssWidth(pendingWidthRef.current);
      };

      cleanupResizeRef.current?.();

      const onPointerMove = (moveEvent: PointerEvent) => {
        const nextWidth = clampSidePanelWidth(
          startWidth - (moveEvent.clientX - startX),
          minWidthRef.current,
          maxWidthRef.current,
        );

        pendingWidthRef.current = nextWidth;

        if (resizeRafRef.current === null) {
          resizeRafRef.current = window.requestAnimationFrame(syncPendingWidth);
        }
      };

      const finishResize = () => {
        setIsResizing(false);
        document.body.style.cursor = previousBodyCursor;
        document.body.style.userSelect = previousBodyUserSelect;

        if (resizeRafRef.current !== null) {
          window.cancelAnimationFrame(resizeRafRef.current);
          resizeRafRef.current = null;
        }

        commitWidth(pendingWidthRef.current ?? widthRef.current);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", finishResize);
        window.removeEventListener("pointercancel", finishResize);
        cleanupResizeRef.current = null;
      };

      cleanupResizeRef.current = finishResize;
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", finishResize);
      window.addEventListener("pointercancel", finishResize);
    },
    [commitWidth, enabled, setCssWidth],
  );

  const onResizeDoubleClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled) {
        return;
      }

      event.preventDefault();

      commitWidth(initialWidthRef.current, false);
    },
    [commitWidth, enabled],
  );

  const onResizeKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!enabled) return;

      const step = event.shiftKey ? SIDE_PANEL_RESIZE_KEYBOARD_STEP * 2 : SIDE_PANEL_RESIZE_KEYBOARD_STEP;
      const nextWidth =
        event.key === "ArrowLeft"
          ? widthRef.current + step
          : event.key === "ArrowRight"
            ? widthRef.current - step
            : event.key === "Home"
              ? minWidthRef.current
              : event.key === "End"
                ? maxWidthRef.current
                : null;

      if (nextWidth === null) return;
      event.preventDefault();
      commitWidth(nextWidth);
    },
    [commitWidth, enabled],
  );

  return {
    isResizing,
    onResizeDoubleClick,
    onResizeKeyDown,
    onResizeStart,
    rootRef: setRootElement,
    width,
  };
}
