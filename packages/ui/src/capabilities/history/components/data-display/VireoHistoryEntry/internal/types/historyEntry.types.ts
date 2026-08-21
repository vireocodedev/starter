import type { VireoHistoryEntryLabels } from "@/capabilities/history/components/data-display/VireoHistoryEntry/VireoHistoryEntry.types";

export type HistoryEntryDisclosure = {
  defaultExpandedDepth: number;
  isExpanded: (path: readonly string[], depth: number) => boolean;
  labels: VireoHistoryEntryLabels;
  onToggleExpanded: (path: readonly string[], depth: number) => void;
  onToggleShowUnchanged: () => void;
  showUnchanged: boolean;
};
