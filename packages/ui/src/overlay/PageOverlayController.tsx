import {
  PageOverlayControllerContext,
  type PageOverlayControllerValue,
  usePageOverlayController,
} from "./PageOverlayControllerContext";
import React from "react";
import { createPortal } from "react-dom";

/**
 * App-level controller for page overlays. Overlays register here and portal
 * their content into a single shared outlet, so the create/update form and the
 * history overlay render from the same place. Opening any overlay closes the
 * others (mutual exclusion), while each overlay keeps its own mount lifecycle so
 * open/close transitions animate normally.
 */
export function PageOverlayControllerProvider({ children }: { children: React.ReactNode }) {
  const [hostElement, setHostElementState] = React.useState<HTMLElement | null>(null);
  const registry = React.useRef(new Map<string, () => void>());

  const setHostElement = React.useCallback((element: HTMLElement | null) => {
    setHostElementState(element);
  }, []);

  const register = React.useCallback((key: string, requestClose: () => void) => {
    registry.current.set(key, requestClose);
  }, []);

  const unregister = React.useCallback((key: string) => {
    registry.current.delete(key);
  }, []);

  const requestExclusive = React.useCallback((key: string) => {
    registry.current.forEach((requestClose, registeredKey) => {
      if (registeredKey !== key) {
        requestClose();
      }
    });
  }, []);

  const value = React.useMemo<PageOverlayControllerValue>(
    () => ({ hostElement, setHostElement, register, unregister, requestExclusive }),
    [hostElement, setHostElement, register, unregister, requestExclusive],
  );

  return <PageOverlayControllerContext.Provider value={value}>{children}</PageOverlayControllerContext.Provider>;
}

export type PageOverlayProps = {
  overlayKey?: string;
  open: boolean;
  onRequestClose: () => void;
  render: React.ReactNode | (() => React.ReactNode);
};

/**
 * Registers a single overlay with the controller and portals its content into
 * the shared outlet. Pass a falsy {@link render} while the overlay is unmounted.
 */
export function PageOverlay({ overlayKey = "page-overlay", open, onRequestClose, render }: PageOverlayProps) {
  const { hostElement, register, unregister, requestExclusive } = usePageOverlayController();
  const closeRef = React.useRef(onRequestClose);
  closeRef.current = onRequestClose;
  const wasOpenRef = React.useRef(false);

  React.useEffect(() => {
    register(overlayKey, () => closeRef.current());
    return () => unregister(overlayKey);
  }, [overlayKey, register, unregister]);

  React.useEffect(() => {
    if (open && !wasOpenRef.current) {
      requestExclusive(overlayKey);
    }
    wasOpenRef.current = open;
  }, [open, overlayKey, requestExclusive]);

  if (!hostElement) {
    return null;
  }

  return createPortal(typeof render === "function" ? render() : render, hostElement);
}

export function PageOverlayOutlet() {
  const { setHostElement } = usePageOverlayController();
  return <div ref={setHostElement} style={{ display: "contents" }} />;
}
