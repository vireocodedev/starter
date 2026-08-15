import {
  OVERLAY_HISTORY_STATE_KEY,
  type OverlayHistoryAction,
  type OverlayHistoryEntryId,
  type OverlayHistoryResolveInput,
} from "./overlayHistory.types";

function isEntryIdList(value: unknown): value is OverlayHistoryEntryId[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

/** Reads the synthetic overlay stack out of a react-router location state. */
export function readOverlayStack(state: unknown): OverlayHistoryEntryId[] {
  if (typeof state !== "object" || state === null) {
    return [];
  }

  const stack = (state as Record<string, unknown>)[OVERLAY_HISTORY_STATE_KEY];

  return isEntryIdList(stack) ? [...stack] : [];
}

/** Returns a location state carrying `stack`, preserving any consumer-provided state. */
export function withOverlayStack(state: unknown, stack: readonly OverlayHistoryEntryId[]): Record<string, unknown> {
  const base = typeof state === "object" && state !== null ? { ...(state as Record<string, unknown>) } : {};

  if (stack.length === 0) {
    delete base[OVERLAY_HISTORY_STATE_KEY];
    return base;
  }

  base[OVERLAY_HISTORY_STATE_KEY] = [...stack];
  return base;
}

export function getCommonPrefixLength(
  left: readonly OverlayHistoryEntryId[],
  right: readonly OverlayHistoryEntryId[],
): number {
  const max = Math.min(left.length, right.length);
  let index = 0;

  while (index < max && left[index] === right[index]) {
    index += 1;
  }

  return index;
}

/**
 * Pure state machine that decides the single next history operation.
 *
 * Invariant: the synthetic overlay stack encoded in the location state must
 * mirror the list of open overlays, one history entry per overlay layer. Every
 * divergence is repaired with exactly one operation so that each browser back
 * press dismisses exactly one layer.
 *
 * Order matters:
 * 1. A URL change means the route itself moved; overlays are about to unmount,
 *    so nothing is repaired until the registry settles.
 * 2. A POP that dropped an entry whose overlay is still open is a back press:
 *    ask that overlay to close (which runs its unsaved-changes guard). The
 *    entry is intentionally *not* re-pushed here — the next pass does that via
 *    rule 4 if the overlay refused to close, which is what keeps "Stay" working.
 * 3. Surplus entries (overlay already closed) are consumed one at a time.
 * 4. Missing entries are pushed one at a time.
 */
export function resolveOverlayHistoryAction({
  desired,
  actual,
  previousActual,
  navigationType,
  locationChanged,
  urlChanged,
}: OverlayHistoryResolveInput): OverlayHistoryAction {
  if (locationChanged && urlChanged) {
    return { type: "idle" };
  }

  if (locationChanged && navigationType === "POP") {
    const poppedStillOpen = [...previousActual].reverse().find(id => !actual.includes(id) && desired.includes(id));

    if (poppedStillOpen !== undefined) {
      return { type: "requestClose", id: poppedStillOpen };
    }
  }

  const commonPrefixLength = getCommonPrefixLength(desired, actual);

  if (actual.length > commonPrefixLength) {
    return { type: "consume" };
  }

  if (desired.length > commonPrefixLength) {
    return { type: "push", stack: [...actual, desired[commonPrefixLength]] };
  }

  return { type: "idle" };
}
