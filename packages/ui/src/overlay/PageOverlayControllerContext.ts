import React from "react";

export type PageOverlayControllerValue = {
  hostElement: HTMLElement | null;
  setHostElement: (element: HTMLElement | null) => void;
  register: (key: string, requestClose: () => void) => void;
  unregister: (key: string) => void;
  requestExclusive: (key: string) => void;
};

export const PageOverlayControllerContext = React.createContext<PageOverlayControllerValue | null>(null);

export function usePageOverlayController(): PageOverlayControllerValue {
  const controller = React.useContext(PageOverlayControllerContext);

  if (!controller) {
    throw new Error("usePageOverlayController must be used within PageOverlayControllerProvider");
  }

  return controller;
}
