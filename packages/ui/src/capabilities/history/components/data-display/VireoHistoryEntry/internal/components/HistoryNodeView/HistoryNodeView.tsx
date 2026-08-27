import { HistoryFieldRowView } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/components/HistoryFieldRowView/HistoryFieldRowView";
import { HistoryGroupView } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/components/HistoryGroupView/HistoryGroupView";
import type { HistoryEntryDisclosure } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/types/historyEntry.types";
import type { HistoryNode } from "@vireocodedev/history";

export function HistoryNodeView({
  disclosure,
  emptyValue,
  hasUnchanged,
  node,
  rootMeta,
  showRootEntityLabel,
}: {
  disclosure: HistoryEntryDisclosure;
  emptyValue?: React.ReactNode;
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
        emptyValue={emptyValue}
        group={node}
        hasUnchanged={hasUnchanged}
        rootMeta={rootMeta}
        showRootEntityLabel={showRootEntityLabel}
      />
    );
  }

  return <HistoryFieldRowView depth={0} emptyValue={emptyValue} labels={disclosure.labels} row={node} />;
}
