import { type OverlayHistoryEntry, type OverlayHistoryEntryId } from "./overlayHistory.types";
import { signal } from "@preact/signals-react";

/**
 * Ordered registry of the overlay layers that currently want a browser history
 * entry, bottom layer first. This is global single-lifecycle state (there is
 * exactly one browser history), so it lives in a signal rather than in React
 * state: overlays register from anywhere in the tree and the bridge stays
 * remount-safe.
 */
export const sigOverlayHistoryEntries = signal<readonly OverlayHistoryEntry[]>([]);

export function registerOverlayHistoryEntry(entry: OverlayHistoryEntry): void {
  const current = sigOverlayHistoryEntries.peek();

  if (current.some(existing => existing.id === entry.id)) {
    sigOverlayHistoryEntries.value = current.map(existing => (existing.id === entry.id ? entry : existing));
    return;
  }

  sigOverlayHistoryEntries.value = [...current, entry];
}

export function unregisterOverlayHistoryEntry(id: OverlayHistoryEntryId): void {
  const current = sigOverlayHistoryEntries.peek();

  if (!current.some(entry => entry.id === id)) {
    return;
  }

  sigOverlayHistoryEntries.value = current.filter(entry => entry.id !== id);
}

/** Test-only reset so the module-level registry cannot leak between test cases. */
export function resetOverlayHistoryEntries(): void {
  sigOverlayHistoryEntries.value = [];
}

/**
 * Subscribes to registry changes. Used with `useSyncExternalStore` so the bridge
 * re-renders even in environments without the signals babel transform (vitest).
 */
export function subscribeToOverlayHistoryEntries(onStoreChange: () => void): () => void {
  return sigOverlayHistoryEntries.subscribe(() => onStoreChange());
}

export function getOverlayHistoryEntriesSnapshot(): readonly OverlayHistoryEntry[] {
  return sigOverlayHistoryEntries.peek();
}
