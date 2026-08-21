import { HistoryFieldRowView } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/components/HistoryFieldRowView/HistoryFieldRowView";
import { HistoryGroupView } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/components/HistoryGroupView/HistoryGroupView";
import type { HistoryEntryDisclosure } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/types/historyEntry.types";
import type { HistoryNode } from "@vireocodedev/starter-history";

export function HistoryNodeView({
  disclosure,
  hasUnchanged,
  node,
  rootMeta,
  showRootEntityLabel,
}: {
  disclosure: HistoryEntryDisclosure;
  hasUnchanged: boolean;
  node: HistoryNode;
  rootMeta?: React.ReactNode;
  showRootEntityLabel: boolean;
}): React.ReactElement {
  if (node.type === "group") {
    return (
      <HistoryGroupView
        depth={1}
        disclosure={disclosure}
        group={node}
        hasUnchanged={hasUnchanged}
        rootMeta={rootMeta}
        showRootEntityLabel={showRootEntityLabel}
      />
    );
  }

  return <HistoryFieldRowView depth={0} labels={disclosure.labels} row={node} />;
}
