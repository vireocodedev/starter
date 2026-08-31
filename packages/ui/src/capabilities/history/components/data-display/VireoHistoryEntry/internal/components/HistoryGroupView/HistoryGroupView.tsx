import { HistoryFieldRowView } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/components/HistoryFieldRowView/HistoryFieldRowView";
import {
  HistoryStatusBadge,
  type HistoryStatus,
} from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/components/HistoryStatusBadge";
import type { HistoryEntryDisclosure } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/types/historyEntry.types";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { Button, ButtonBase, Collapse } from "@mui/material";
import type { HistoryGroupNode, HistoryNode } from "@vireocodedev/history";
import { getHistoryPathKey } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/utils/getHistoryPathKey";

function isVisible(node: HistoryNode, showUnchanged: boolean): boolean {
  if (node.type === "group") {
    if (node.children.length === 0) return node.changeType !== "unchanged";
    return node.children.some(child => isVisible(child, showUnchanged));
  }
  return showUnchanged || node.type !== "unchanged";
}

function countChangedFields(nodes: readonly HistoryNode[]): number {
  return nodes.reduce(
    (count, node) =>
      count + (node.type === "group" ? countChangedFields(node.children) : node.type === "unchanged" ? 0 : 1),
    0,
  );
}

function getGroupStatus(group: HistoryGroupNode): HistoryStatus {
  const statuses = new Set<HistoryStatus>();

  const collectStatuses = (nodes: readonly HistoryNode[]) => {
    nodes.forEach(node => {
      if (node.type === "group") {
        collectStatuses(node.children);
      } else {
        statuses.add(node.type);
      }
    });
  };

  collectStatuses(group.children);

  if (statuses.size === 0) return group.changeType;
  if (statuses.size === 1) return statuses.values().next().value ?? "updated";
  return "updated";
}

export function HistoryGroupView({
  depth,
  disclosure,
  emptyValue,
  group,
  hasUnchanged,
  rootMeta,
  showRootEntityLabel,
}: {
  depth: number;
  disclosure: HistoryEntryDisclosure;
  emptyValue?: React.ReactNode;
  group: HistoryGroupNode;
  hasUnchanged: boolean;
  rootMeta?: React.ReactNode;
  showRootEntityLabel: boolean;
}): React.ReactElement | null {
  const isRoot = depth === 1;
  const expanded = disclosure.isExpanded(group.path, depth);
  const visibleChildren = group.children.filter(child => isVisible(child, disclosure.showUnchanged));
  const hasVisibleChildren = visibleChildren.length > 0;
  const status = getGroupStatus(group);
  const count = hasVisibleChildren ? countChangedFields(group.children) : group.changeType === "unchanged" ? 0 : 1;

  if (!isRoot && !hasVisibleChildren && group.changeType === "unchanged") return null;

  const summary = (
    <>
      {hasVisibleChildren ? (
        <KeyboardArrowDownRoundedIcon className="VireoHistoryEntry-summaryChevron" fontSize="small" />
      ) : null}
      <HistoryStatusBadge focusable={false} status={status} labels={disclosure.labels} />
      <span className="VireoHistoryEntry-summaryText">
        <span className="VireoHistoryEntry-summaryPrimary">
          {isRoot && !showRootEntityLabel ? (rootMeta ?? group.label) : group.label}
          {(!isRoot || showRootEntityLabel) && group.value != null && group.value.formatted !== group.label ? (
            <span className="VireoHistoryEntry-groupIdentity"> · {group.value.formatted}</span>
          ) : null}
        </span>
        {isRoot && showRootEntityLabel && rootMeta != null ? (
          <span className="VireoHistoryEntry-summaryMeta">{rootMeta}</span>
        ) : null}
      </span>
      {!isRoot ? <span className="VireoHistoryEntry-groupCount">{disclosure.labels.changes(count)}</span> : null}
    </>
  );

  return (
    <div
      className={isRoot ? "VireoHistoryEntry-rootGroup" : "VireoHistoryEntry-nestedGroup"}
      data-depth={depth}
      data-expanded={expanded || undefined}
      style={{ "--VireoHistoryEntry-depth": Math.min(depth - 1, 4) } as React.CSSProperties}
      role={isRoot ? undefined : "group"}
    >
      <div className={isRoot ? "VireoHistoryEntry-rootHeader" : "VireoHistoryEntry-nestedHeader"}>
        {hasVisibleChildren ? (
          <ButtonBase
            className={isRoot ? "VireoHistoryEntry-rootSummaryButton" : "VireoHistoryEntry-groupSummary"}
            aria-expanded={expanded}
            aria-label={`${expanded ? disclosure.labels.collapseSection : disclosure.labels.expandSection} ${group.label}`}
            onClick={() => disclosure.onToggleExpanded(group.path, depth)}
          >
            {summary}
          </ButtonBase>
        ) : (
          <div className={isRoot ? "VireoHistoryEntry-rootSummaryButton" : "VireoHistoryEntry-groupSummary"}>
            {summary}
          </div>
        )}
        {isRoot && expanded && hasUnchanged ? (
          <Button
            className="VireoHistoryEntry-unchangedAction"
            size="small"
            type="button"
            onClick={disclosure.onToggleShowUnchanged}
          >
            {disclosure.showUnchanged ? disclosure.labels.hideUnchanged : disclosure.labels.showUnchanged}
          </Button>
        ) : null}
      </div>
      {hasVisibleChildren ? (
        <Collapse in={expanded} timeout={150} unmountOnExit>
          <div
            className={isRoot ? "VireoHistoryEntry-expandedBody" : "VireoHistoryEntry-groupChildren"}
            style={
              isRoot
                ? undefined
                : ({
                    "--VireoHistoryEntry-connectorDepth": Math.min(Math.max(depth - 2, 0), 3),
                  } as React.CSSProperties)
            }
          >
            {isRoot ? (
              <div className="VireoHistoryEntry-columnHeadings" aria-hidden="true">
                <span>{disclosure.labels.field}</span>
                <span>{disclosure.labels.previous}</span>
                <span>{disclosure.labels.current}</span>
              </div>
            ) : null}
            {visibleChildren.map(child =>
              child.type === "group" ? (
                <HistoryGroupView
                  key={getHistoryPathKey(child.path)}
                  depth={depth + 1}
                  disclosure={disclosure}
                  emptyValue={emptyValue}
                  group={child}
                  hasUnchanged={hasUnchanged}
                  showRootEntityLabel={showRootEntityLabel}
                />
              ) : (
                <HistoryFieldRowView
                  key={`${getHistoryPathKey(child.path)}:${child.type}`}
                  depth={depth - 1}
                  emptyValue={emptyValue}
                  labels={disclosure.labels}
                  row={child}
                />
              ),
            )}
          </div>
        </Collapse>
      ) : null}
    </div>
  );
}
