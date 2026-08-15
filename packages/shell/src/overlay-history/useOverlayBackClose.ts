import { registerOverlayHistoryEntry, unregisterOverlayHistoryEntry } from "./overlayHistory.store";
import { type OverlayHistoryEntryId } from "./overlayHistory.types";
import React from "react";

export type UseOverlayBackCloseOptions = {
  /** Whether this overlay layer is currently visible. */
  open: boolean;
  /**
   * Invoked when the browser back button dismisses this layer. Pass the same
   * callback the close button uses so guards (unsaved changes) still run.
   */
  onRequestClose: () => void;
  /** Set to false to opt a surface out of history-integrated dismissal. */
  enabled?: boolean;
  /** Stable id override; defaults to a per-instance React id. */
  id?: OverlayHistoryEntryId;
};

/**
 * Makes an overlay layer participate in browser history: while it is open a
 * synthetic same-URL history entry is kept alive by `OverlayHistoryBridge`,
 * so browser back closes this layer instead of changing the route. Nested
 * layers (e.g. a slide-in sub-screen) each call this hook and are dismissed one
 * at a time, topmost first.
 */
export function useOverlayBackClose({
  open,
  onRequestClose,
  enabled = true,
  id: providedId,
}: UseOverlayBackCloseOptions): void {
  const generatedId = React.useId();
  const id = providedId ?? generatedId;
  const requestCloseRef = React.useRef(onRequestClose);
  requestCloseRef.current = onRequestClose;

  React.useEffect(() => {
    if (!enabled || !open) {
      return;
    }

    registerOverlayHistoryEntry({ id, requestClose: () => requestCloseRef.current() });

    return () => unregisterOverlayHistoryEntry(id);
  }, [enabled, id, open]);
}
