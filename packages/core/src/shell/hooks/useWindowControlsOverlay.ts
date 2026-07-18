import React from "react";

export const APP_WINDOW_CONTROLS_OVERLAY_HEIGHT_CSS_VAR = "--app-window-controls-overlay-height";
export const APP_WINDOW_CONTROLS_OVERLAY_LEFT_INSET_CSS_VAR = "--app-window-controls-overlay-left-inset";
export const APP_WINDOW_CONTROLS_OVERLAY_RIGHT_INSET_CSS_VAR = "--app-window-controls-overlay-right-inset";

export type AppWindowControlsOverlayState = {
  visible: boolean;
  height: number;
  leftInset: number;
  rightInset: number;
};

const HIDDEN_WINDOW_CONTROLS_OVERLAY_STATE: AppWindowControlsOverlayState = {
  visible: false,
  height: 0,
  leftInset: 0,
  rightInset: 0,
};

function roundCssPixel(value: number): number {
  return Math.max(0, Math.round(Number.isFinite(value) ? value : 0));
}

function readWindowControlsOverlayState(): AppWindowControlsOverlayState {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return HIDDEN_WINDOW_CONTROLS_OVERLAY_STATE;
  }

  const overlay = navigator.windowControlsOverlay;

  if (!overlay?.visible) {
    return HIDDEN_WINDOW_CONTROLS_OVERLAY_STATE;
  }

  try {
    const rect = overlay.getTitlebarAreaRect();
    const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
    const leftInset = roundCssPixel(rect.x);
    const rightInset = roundCssPixel(viewportWidth - (rect.x + rect.width));

    return {
      visible: true,
      height: roundCssPixel(rect.height),
      leftInset,
      rightInset,
    };
  } catch {
    return HIDDEN_WINDOW_CONTROLS_OVERLAY_STATE;
  }
}

function windowControlsOverlayStatesEqual(
  current: AppWindowControlsOverlayState,
  next: AppWindowControlsOverlayState,
): boolean {
  return (
    current.visible === next.visible &&
    current.height === next.height &&
    current.leftInset === next.leftInset &&
    current.rightInset === next.rightInset
  );
}

export function createWindowControlsOverlayRootStyle(
  state: AppWindowControlsOverlayState,
): React.CSSProperties {
  return {
    [APP_WINDOW_CONTROLS_OVERLAY_HEIGHT_CSS_VAR]: `${state.height}px`,
    [APP_WINDOW_CONTROLS_OVERLAY_LEFT_INSET_CSS_VAR]: `${state.leftInset}px`,
    [APP_WINDOW_CONTROLS_OVERLAY_RIGHT_INSET_CSS_VAR]: `${state.rightInset}px`,
  } as React.CSSProperties;
}

export function useWindowControlsOverlay(): AppWindowControlsOverlayState {
  const [state, setState] = React.useState<AppWindowControlsOverlayState>(readWindowControlsOverlayState);

  React.useEffect(() => {
    const overlay = navigator.windowControlsOverlay;

    if (!overlay) {
      setState(HIDDEN_WINDOW_CONTROLS_OVERLAY_STATE);
      return;
    }

    let pendingFrame: number | null = null;

    const update = () => {
      pendingFrame = null;
      const next = readWindowControlsOverlayState();
      setState(current => (windowControlsOverlayStatesEqual(current, next) ? current : next));
    };

    const scheduleUpdate = () => {
      if (pendingFrame !== null) {
        return;
      }

      pendingFrame = window.requestAnimationFrame(update);
    };

    update();
    overlay.addEventListener("geometrychange", scheduleUpdate);
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      overlay.removeEventListener("geometrychange", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);

      if (pendingFrame !== null) {
        window.cancelAnimationFrame(pendingFrame);
      }
    };
  }, []);

  return state;
}
