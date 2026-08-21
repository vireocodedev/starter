import { HistoryFieldRowView } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/components/HistoryFieldRowView/HistoryFieldRowView";
import {
  HistoryStatusBadge,
  type HistoryStatus,
} from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/components/HistoryStatusBadge";
import type { HistoryEntryDisclosure } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/types/historyEntry.types";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { Button, ButtonBase, Collapse } from "@mui/material";
import type { HistoryGroupNode, HistoryNode } from "@vireocodedev/starter-history";

function isVisible(node: HistoryNode, showUnchanged: boolean): boolean {
  if (node.type === "group") return node.children.some(child => isVisible(child, showUnchanged));
  return showUnchanged || node.type !== "unchanged";
}

function countVisibleFields(nodes: readonly HistoryNode[], showUnchanged: boolean): number {
  return nodes.reduce(
    (count, node) =>
      count +
      (node.type === "group"
        ? countVisibleFields(node.children, showUnchanged)
        : isVisible(node, showUnchanged)
          ? 1
          : 0),
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

  if (statuses.size === 1) return statuses.values().next().value ?? "updated";
  return "updated";
}

export function HistoryGroupView({
  depth,
  disclosure,
  group,
  hasUnchanged,
  rootMeta,
  showRootEntityLabel,
}: {
  depth: number;
  disclosure: HistoryEntryDisclosure;
  group: HistoryGroupNode;
  hasUnchanged: boolean;
  rootMeta?: React.ReactNode;
  showRootEntityLabel: boolean;
}): React.ReactElement | null {
  const isRoot = depth === 1;
  const expanded = disclosure.isExpanded(group.path, depth);
  const visibleChildren = group.children.filter(child => isVisible(child, disclosure.showUnchanged));
  const status = getGroupStatus(group);
  const count = countVisibleFields(group.children, disclosure.showUnchanged);

  if (!isRoot && visibleChildren.length === 0) return null;

  return (
    <div
      className={isRoot ? "VireoHistoryEntry-rootGroup" : "VireoHistoryEntry-nestedGroup"}
      data-depth={depth}
      data-expanded={expanded || undefined}
      style={{ "--VireoHistoryEntry-depth": Math.min(depth - 1, 4) } as React.CSSProperties}
      role={isRoot ? undefined : "group"}
      aria-level={isRoot ? undefined : depth}
    >
      <div className={isRoot ? "VireoHistoryEntry-rootHeader" : "VireoHistoryEntry-nestedHeader"}>
        <ButtonBase
          className={isRoot ? "VireoHistoryEntry-rootSummaryButton" : "VireoHistoryEntry-groupSummary"}
          aria-expanded={expanded}
          aria-label={`${expanded ? disclosure.labels.collapseSection : disclosure.labels.expandSection} ${group.label}`}
          onClick={() => disclosure.onToggleExpanded(group.path, depth)}
        >
          <KeyboardArrowDownRoundedIcon className="VireoHistoryEntry-summaryChevron" fontSize="small" />
          <HistoryStatusBadge focusable={false} status={status} labels={disclosure.labels} />
          <span className="VireoHistoryEntry-summaryText">
            <span className="VireoHistoryEntry-summaryPrimary">
              {isRoot && !showRootEntityLabel ? (rootMeta ?? group.label) : group.label}
              {(!isRoot || showRootEntityLabel) && group.value != null && group.value !== group.label ? (
                <span className="VireoHistoryEntry-groupIdentity"> · {group.value}</span>
              ) : null}
            </span>
            {isRoot && showRootEntityLabel && rootMeta != null ? (
              <span className="VireoHistoryEntry-summaryMeta">{rootMeta}</span>
            ) : null}
          </span>
          {!isRoot ? <span className="VireoHistoryEntry-groupCount">{disclosure.labels.changes(count)}</span> : null}
        </ButtonBase>
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
                key={child.path.join(".") || "$group"}
                depth={depth + 1}
                disclosure={disclosure}
                group={child}
                hasUnchanged={hasUnchanged}
                showRootEntityLabel={showRootEntityLabel}
              />
            ) : (
              <HistoryFieldRowView
                key={`${child.path.join(".")}:${child.type}`}
                depth={depth - 1}
                labels={disclosure.labels}
                row={child}
              />
            ),
          )}
        </div>
      </Collapse>
    </div>
  );
}
