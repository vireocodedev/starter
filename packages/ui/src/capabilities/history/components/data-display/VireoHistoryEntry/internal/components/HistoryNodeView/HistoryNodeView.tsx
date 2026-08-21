import { HistoryFieldRowView } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/components/HistoryFieldRowView/HistoryFieldRowView";
import { HistoryGroupView } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/components/HistoryGroupView/HistoryGroupView";
import type { VireoHistoryEntryLabels } from "@/capabilities/history/components/data-display/VireoHistoryEntry/VireoHistoryEntry.types";
import { type HistoryNode } from "@vireocodedev/starter-history";

const HISTORY_TABLE_STYLE: React.CSSProperties = {
  width: "100%",
  fontFamily: "monospace",
  lineHeight: 1.125,
};

export function HistoryNodeView({
  node,
  rootMeta,
  showRootEntityLabel = false,
  defaultExpandedDepth = 3,
  defaultShowUnchanged = false,
  labels,
}: {
  node: HistoryNode;
  rootMeta?: React.ReactNode;
  showRootEntityLabel?: boolean;
  defaultExpandedDepth?: number;
  defaultShowUnchanged?: boolean;
  labels: VireoHistoryEntryLabels;
}): React.ReactElement {
  if (node.type === "group") {
    return (
      <HistoryGroupView
        group={node}
        rootMeta={rootMeta}
        showRootEntityLabel={showRootEntityLabel}
        depth={1}
        defaultExpandedDepth={defaultExpandedDepth}
        defaultShowUnchanged={defaultShowUnchanged}
        labels={labels}
      />
    );
  }

  return (
    <div style={HISTORY_TABLE_STYLE}>
      <HistoryFieldRowView row={node} labels={labels} />
    </div>
  );
}
