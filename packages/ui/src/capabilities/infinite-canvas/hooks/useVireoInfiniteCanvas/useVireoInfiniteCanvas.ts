import { VireoInfiniteCanvasContext } from "@/capabilities/infinite-canvas/contexts/VireoInfiniteCanvasContext/VireoInfiniteCanvasContext";
import React from "react";
/** Accesses transform state and coordinate/fullscreen actions for the nearest VireoInfiniteCanvas. */
export function useVireoInfiniteCanvas() {
  const context = React.useContext(VireoInfiniteCanvasContext);
  if (!context) throw new Error("useVireoInfiniteCanvas must be used within VireoInfiniteCanvas");
  return context;
}
