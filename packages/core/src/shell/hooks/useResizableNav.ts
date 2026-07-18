import {
  ensureValidNavWidth,
  NAV_COLLAPSE_TRIGGER_WIDTH,
  NAV_COLLAPSED_WIDTH,
  NAV_DEFAULT_EXPANDED_WIDTH,
  NAV_MIN_EXPANDED_WIDTH,
  NAV_WIDTH_CSS_VAR,
} from "@/shell/layout/layoutNav.constants";
import React from "react";

function getVisualNavResizeWidth(width: number, maxWidth: number, collapsed: boolean): number {
  if (width <= NAV_COLLAPSE_TRIGGER_WIDTH || (collapsed && width < NAV_MIN_EXPANDED_WIDTH)) {
    return NAV_COLLAPSED_WIDTH;
  }

  return ensureValidNavWidth(width, { maxWidth });
}

export function useResizableNav({
  initialCollapsed,
  initialWidth,
  isMobile,
  loginMode,
  maxDesktopNavWidth,
  navLocked,
  setNavCollapsed,
  setNavWidth,
  shellRootRef,
}: {
  initialCollapsed: boolean;
  initialWidth: number;
  isMobile: boolean;
  loginMode: boolean;
  maxDesktopNavWidth: number;
  navLocked: boolean;
  setNavCollapsed: (collapsed: boolean) => void;
  setNavWidth: (width: number) => void;
  shellRootRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [desktopCollapsed, setDesktopCollapsed] = React.useState(initialCollapsed);
  const [desktopWidth, setDesktopWidth] = React.useState(initialWidth);
  const [desktopResizing, setDesktopResizing] = React.useState(false);
  const desktopCollapsedRef = React.useRef(desktopCollapsed);
  const resizeRafRef = React.useRef<number | null>(null);
  const pendingWidthRef = React.useRef<number | null>(null);

  const desktopExpandedWidth = React.useMemo(
    () => ensureValidNavWidth(desktopWidth, { maxWidth: maxDesktopNavWidth }),
    [desktopWidth, maxDesktopNavWidth],
  );
  const desktopNavWidth = loginMode
    ? NAV_DEFAULT_EXPANDED_WIDTH
    : desktopCollapsed
      ? NAV_COLLAPSED_WIDTH
      : desktopExpandedWidth;

  const setCssNavWidth = React.useCallback(
    (width: number) => {
      shellRootRef.current?.style.setProperty(NAV_WIDTH_CSS_VAR, `${width}px`);
    },
    [shellRootRef],
  );

  const setVisualCollapsed = React.useCallback((collapsed: boolean) => {
    desktopCollapsedRef.current = collapsed;
    setDesktopCollapsed(collapsed);
  }, []);

  const applyCollapsed = React.useCallback(
    (collapsed: boolean) => {
      desktopCollapsedRef.current = collapsed;
      setDesktopCollapsed(collapsed);
      setNavCollapsed(collapsed);
    },
    [setNavCollapsed],
  );

  const applyWidth = React.useCallback(
    (width: number) => {
      const validWidth = ensureValidNavWidth(width, { maxWidth: maxDesktopNavWidth });
      setDesktopWidth(validWidth);
      setNavWidth(validWidth);
    },
    [maxDesktopNavWidth, setNavWidth],
  );

  React.useEffect(() => {
    setCssNavWidth(desktopNavWidth);
  }, [desktopNavWidth, setCssNavWidth]);

  const onToggleCollapsed = React.useCallback(() => {
    if (navLocked || loginMode) {
      return;
    }

    if (desktopCollapsed) {
      applyCollapsed(false);
      if (desktopExpandedWidth < NAV_MIN_EXPANDED_WIDTH) {
        applyWidth(NAV_DEFAULT_EXPANDED_WIDTH);
      }
      return;
    }

    applyCollapsed(true);
  }, [applyCollapsed, applyWidth, desktopCollapsed, desktopExpandedWidth, loginMode, navLocked]);

  const onResizeStart = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile || navLocked || loginMode || typeof window === "undefined") {
        return;
      }

      if (event.detail > 1) {
        return;
      }

      event.preventDefault();

      const startX = event.clientX;
      const startWidth = desktopCollapsed ? NAV_COLLAPSED_WIDTH : desktopExpandedWidth;
      const previousBodyCursor = document.body.style.cursor;
      const previousBodyUserSelect = document.body.style.userSelect;

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      setDesktopResizing(true);
      pendingWidthRef.current = null;

      const syncPendingWidth = () => {
        resizeRafRef.current = null;

        if (pendingWidthRef.current === null) {
          return;
        }

        setCssNavWidth(
          getVisualNavResizeWidth(pendingWidthRef.current, maxDesktopNavWidth, desktopCollapsedRef.current),
        );
      };

      const onMouseMove = (moveEvent: MouseEvent) => {
        const nextWidth = startWidth + (moveEvent.clientX - startX);
        pendingWidthRef.current = nextWidth;

        if (!desktopCollapsedRef.current && nextWidth <= NAV_COLLAPSE_TRIGGER_WIDTH) {
          setVisualCollapsed(true);
        }

        if (desktopCollapsedRef.current && nextWidth >= NAV_MIN_EXPANDED_WIDTH) {
          setVisualCollapsed(false);
        }

        if (resizeRafRef.current === null) {
          resizeRafRef.current = window.requestAnimationFrame(syncPendingWidth);
        }
      };

      const onMouseUp = () => {
        document.body.style.cursor = previousBodyCursor;
        document.body.style.userSelect = previousBodyUserSelect;
        setDesktopResizing(false);

        if (resizeRafRef.current !== null) {
          window.cancelAnimationFrame(resizeRafRef.current);
          resizeRafRef.current = null;
        }

        const nextWidth = pendingWidthRef.current ?? startWidth;
        pendingWidthRef.current = null;

        if (nextWidth <= NAV_COLLAPSE_TRIGGER_WIDTH) {
          setCssNavWidth(NAV_COLLAPSED_WIDTH);
          applyCollapsed(true);
        } else {
          const validWidth = ensureValidNavWidth(nextWidth, { maxWidth: maxDesktopNavWidth });
          setCssNavWidth(validWidth);
          applyCollapsed(false);
          applyWidth(validWidth);
        }

        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [
      applyCollapsed,
      applyWidth,
      desktopCollapsed,
      desktopExpandedWidth,
      isMobile,
      loginMode,
      maxDesktopNavWidth,
      navLocked,
      setCssNavWidth,
      setVisualCollapsed,
    ],
  );

  const onResizeDoubleClick = React.useCallback(() => {
    if (isMobile || navLocked || loginMode) {
      return;
    }

    setCssNavWidth(NAV_DEFAULT_EXPANDED_WIDTH);
    applyCollapsed(false);
    applyWidth(NAV_DEFAULT_EXPANDED_WIDTH);
  }, [applyCollapsed, applyWidth, isMobile, loginMode, navLocked, setCssNavWidth]);

  return {
    desktopCollapsed,
    desktopNavWidth,
    desktopResizing,
    onResizeDoubleClick,
    onResizeStart,
    onToggleCollapsed,
  };
}
