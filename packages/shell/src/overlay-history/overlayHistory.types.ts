/**
 * Key under which the synthetic overlay stack is stored inside the react-router
 * location state. Prefixed so it cannot collide with consumer-provided state.
 */
export const OVERLAY_HISTORY_STATE_KEY = "__appOverlayStack";

/** Stable identifier for a registered overlay surface. */
export type OverlayHistoryEntryId = string;

export type OverlayHistoryEntry = {
  id: OverlayHistoryEntryId;
  /**
   * Close request for this overlay layer. Must route through whatever guard the
   * overlay uses (e.g. the unsaved-changes discard confirmation) so a browser
   * back press behaves exactly like pressing the overlay close button.
   */
  requestClose: () => void;
};

/**
 * Single history operation the bridge should perform to converge the browser
 * history stack towards the set of currently open overlays.
 */
export type OverlayHistoryAction =
  | { type: "idle" }
  /** Push a synthetic same-URL entry carrying `stack`. */
  | { type: "push"; stack: readonly OverlayHistoryEntryId[] }
  /** Consume one synthetic entry that no longer has an open overlay behind it. */
  | { type: "consume" }
  /** A back press popped this overlay's entry: ask the overlay to close. */
  | { type: "requestClose"; id: OverlayHistoryEntryId };

export type OverlayHistoryResolveInput = {
  /** Ids of currently open overlays, bottom layer first. */
  desired: readonly OverlayHistoryEntryId[];
  /** Ids encoded in the current location state, bottom layer first. */
  actual: readonly OverlayHistoryEntryId[];
  /** Ids encoded in the previous location state, bottom layer first. */
  previousActual: readonly OverlayHistoryEntryId[];
  /** Navigation type reported by the router for the current location. */
  navigationType: "POP" | "PUSH" | "REPLACE";
  /** True when the current location is a different history entry than the previous one. */
  locationChanged: boolean;
  /** True when the URL identity (pathname + search + hash) changed. */
  urlChanged: boolean;
};
