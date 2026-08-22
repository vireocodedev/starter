export const OVERLAY_HISTORY_STATE_KEY = "__starterShellOverlayStack";
export type OverlayHistoryEntryId = string;
export type OverlayHistoryEntry = { id: OverlayHistoryEntryId; requestClose: () => void };
export type OverlayHistoryAction =
  | { type: "idle" }
  | { type: "push"; stack: readonly OverlayHistoryEntryId[] }
  | { type: "consume" }
  | { type: "requestClose"; id: OverlayHistoryEntryId };

export type OverlayHistoryResolveInput = {
  desired: readonly OverlayHistoryEntryId[];
  actual: readonly OverlayHistoryEntryId[];
  previousActual: readonly OverlayHistoryEntryId[];
  navigationType: "POP" | "PUSH" | "REPLACE";
  locationChanged: boolean;
  urlChanged: boolean;
};

function isEntryIdList(value: unknown): value is OverlayHistoryEntryId[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

export function readOverlayStack(state: unknown): OverlayHistoryEntryId[] {
  if (typeof state !== "object" || state === null) return [];
  const stack = (state as Record<string, unknown>)[OVERLAY_HISTORY_STATE_KEY];
  return isEntryIdList(stack) ? [...stack] : [];
}

export function withOverlayStack(state: unknown, stack: readonly OverlayHistoryEntryId[]): Record<string, unknown> {
  const nextState = typeof state === "object" && state !== null ? { ...(state as Record<string, unknown>) } : {};
  if (stack.length === 0) delete nextState[OVERLAY_HISTORY_STATE_KEY];
  else nextState[OVERLAY_HISTORY_STATE_KEY] = [...stack];
  return nextState;
}

export function getCommonOverlayPrefixLength(
  left: readonly OverlayHistoryEntryId[],
  right: readonly OverlayHistoryEntryId[],
): number {
  const max = Math.min(left.length, right.length);
  let index = 0;
  while (index < max && left[index] === right[index]) index += 1;
  return index;
}

export function resolveOverlayHistoryAction(input: OverlayHistoryResolveInput): OverlayHistoryAction {
  const { desired, actual, previousActual, navigationType, locationChanged, urlChanged } = input;
  if (locationChanged && urlChanged) return { type: "idle" };

  if (locationChanged && navigationType === "POP") {
    const poppedStillOpen = [...previousActual].reverse().find(id => !actual.includes(id) && desired.includes(id));
    if (poppedStillOpen !== undefined) return { type: "requestClose", id: poppedStillOpen };
  }

  const prefixLength = getCommonOverlayPrefixLength(desired, actual);
  if (actual.length > prefixLength) return { type: "consume" };
  if (desired.length > prefixLength) return { type: "push", stack: [...actual, desired[prefixLength]] };
  return { type: "idle" };
}

export type OverlayHistoryRegistry = {
  register(entry: OverlayHistoryEntry): () => void;
  unregister(id: OverlayHistoryEntryId): void;
  getSnapshot(): readonly OverlayHistoryEntry[];
  subscribe(listener: () => void): () => void;
  clear(): void;
};

export function createOverlayHistoryRegistry(): OverlayHistoryRegistry {
  let entries: readonly OverlayHistoryEntry[] = [];
  const listeners = new Set<() => void>();
  const publish = () => listeners.forEach(listener => listener());

  return {
    register(entry) {
      const exists = entries.some(candidate => candidate.id === entry.id);
      entries = exists
        ? entries.map(candidate => (candidate.id === entry.id ? entry : candidate))
        : [...entries, entry];
      publish();
      return () => this.unregister(entry.id);
    },
    unregister(id) {
      if (!entries.some(entry => entry.id === id)) return;
      entries = entries.filter(entry => entry.id !== id);
      publish();
    },
    getSnapshot() {
      return entries;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    clear() {
      if (entries.length === 0) return;
      entries = [];
      publish();
    },
  };
}
