import type { VireoHistoryEntryLabels } from "@/capabilities/history/components/data-display/VireoHistoryEntry/VireoHistoryEntry.types";
import type { HistoryPath } from "@vireocodedev/starter-history";

export type HistoryEntryDisclosure = {
  defaultExpandedDepth: number;
  isExpanded: (path: HistoryPath, depth: number) => boolean;
  labels: VireoHistoryEntryLabels;
  onToggleExpanded: (path: HistoryPath, depth: number) => void;
  onToggleShowUnchanged: () => void;
  showUnchanged: boolean;
};
