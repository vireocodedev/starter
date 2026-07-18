import { HistoryFieldRowView } from "@/history/components/HistoryFieldRowView";
import { HistoryGroupView } from "@/history/components/HistoryGroupView";
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
}: {
  node: HistoryNode;
  rootMeta?: React.ReactNode;
  showRootEntityLabel?: boolean;
  defaultExpandedDepth?: number;
  defaultShowUnchanged?: boolean;
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
      />
    );
  }

  return (
    <div style={HISTORY_TABLE_STYLE}>
      <HistoryFieldRowView row={node} />
    </div>
  );
}
