import {
  HistoryStatusBadge,
  type HistoryStatus,
} from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/components/HistoryStatusBadge";
import { HistoryValueContent } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/components/HistoryValueContent/HistoryValueContent";
import type { VireoHistoryEntryLabels } from "@/capabilities/history/components/data-display/VireoHistoryEntry/VireoHistoryEntry.types";
import { Button } from "@mui/material";
import type { HistoryFieldRow } from "@vireocodedev/starter-history";
import React from "react";

function getHistoryStatus(row: HistoryFieldRow): HistoryStatus {
  return row.type;
}

function HistoryValueBlock({
  children,
  empty = false,
  expanded,
  label,
  notPresentLabel,
  onOverflowChange,
  placement,
  removed = false,
}: {
  children?: React.ReactNode;
  empty?: boolean;
  expanded: boolean;
  label: string;
  notPresentLabel: string;
  onOverflowChange: (overflowing: boolean) => void;
  placement: "previous" | "current";
  removed?: boolean;
}): React.ReactElement {
  return (
    <div
      className="VireoHistoryEntry-valueBlock"
      data-empty={empty || undefined}
      data-placement={placement}
      data-removed={removed || undefined}
    >
      <span className="VireoHistoryEntry-mobileValueLabel">{label}</span>
      {empty ? (
        <span className="VireoHistoryEntry-visuallyHidden">
          {label}: {notPresentLabel}
        </span>
      ) : (
        <HistoryValueContent expanded={expanded} onOverflowChange={onOverflowChange} removed={removed}>
          {children}
        </HistoryValueContent>
      )}
    </div>
  );
}

export function HistoryFieldRowView({
  depth,
  labels,
  row,
}: {
  depth: number;
  labels: VireoHistoryEntryLabels;
  row: HistoryFieldRow;
}): React.ReactElement {
  const [expanded, setExpanded] = React.useState(false);
  const [previousOverflowing, setPreviousOverflowing] = React.useState(false);
  const [currentOverflowing, setCurrentOverflowing] = React.useState(false);
  const rowKey = `${row.path.join(".")}:${row.type}`;

  React.useEffect(() => {
    setExpanded(false);
    setPreviousOverflowing(false);
    setCurrentOverflowing(false);
  }, [rowKey]);

  const status = getHistoryStatus(row);
  const hasPrevious = row.type === "removed" || row.type === "updated" || row.type === "moved";
  const hasCurrent = row.type !== "removed";
  const showsComparison = row.type === "updated" || row.type === "moved";
  const currentLabel = row.type === "unchanged" ? labels.value : labels.current;
  const expandable = previousOverflowing || currentOverflowing;
  const depthStyle = { "--VireoHistoryEntry-depth": Math.min(depth, 4) } as React.CSSProperties;

  return (
    <div
      className="VireoHistoryEntry-fieldRow"
      data-expanded={expanded || undefined}
      data-status={status}
      role="group"
      aria-label={`${row.label}: ${labels[status]}`}
      style={depthStyle}
    >
      <div className="VireoHistoryEntry-statusCell">
        <HistoryStatusBadge status={status} labels={labels} />
      </div>
      <div className="VireoHistoryEntry-fieldLabel">{row.label}</div>
      {row.type === "unchanged" ? null : (
        <HistoryValueBlock
          empty={!hasPrevious}
          expanded={expanded}
          label={labels.previous}
          notPresentLabel={labels.notPresent}
          onOverflowChange={setPreviousOverflowing}
          placement="previous"
          removed={row.type === "removed"}
        >
          {hasPrevious ? row.previous : null}
        </HistoryValueBlock>
      )}
      {showsComparison ? (
        <span className="VireoHistoryEntry-arrow" aria-hidden="true">
          →
        </span>
      ) : null}
      <HistoryValueBlock
        empty={!hasCurrent}
        expanded={expanded}
        label={currentLabel}
        notPresentLabel={labels.notPresent}
        onOverflowChange={setCurrentOverflowing}
        placement="current"
      >
        {hasCurrent ? row.current : null}
      </HistoryValueBlock>
      {expandable || expanded ? (
        <Button
          className="VireoHistoryEntry-valueToggle"
          type="button"
          size="small"
          aria-expanded={expanded}
          onClick={() => setExpanded(current => !current)}
        >
          {expanded ? labels.showLess : labels.showMore}
        </Button>
      ) : null}
    </div>
  );
}
