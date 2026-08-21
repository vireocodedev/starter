import { HistoryHoverableTableRow } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/components/HistoryHoverableTableRow/HistoryHoverableTableRow";
import { HistoryValueContent } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/components/HistoryValueContent/HistoryValueContent";
import type { VireoHistoryEntryLabels } from "@/capabilities/history/components/data-display/VireoHistoryEntry/VireoHistoryEntry.types";
import { type HistoryFieldRow, type HistoryGroupChangeType } from "@vireocodedev/starter-history";

const CELL_PADDING = "2px 8px";

const COLOR_ERROR = "var(--mui-palette-error-main)";
const COLOR_WARN = "var(--mui-palette-warning-main)";
const COLOR_INFO = "var(--mui-palette-info-main)";
const COLOR_SUCCESS = "var(--mui-palette-success-main)";

const HISTORY_ROW_GRID_STYLE: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "30px minmax(110px, 28%) minmax(0, 1fr) 18px minmax(0, 1fr)",
  alignItems: "start",
  width: "100%",
  minWidth: 0,
};

const HISTORY_DOT_CELL_STYLE: React.CSSProperties = {
  padding: CELL_PADDING,
  textAlign: "center",
  whiteSpace: "nowrap",
  verticalAlign: "top",
};

const HISTORY_LABEL_CELL_STYLE: React.CSSProperties = {
  padding: CELL_PADDING,
  minWidth: 0,
  opacity: 0.8,
};

const HISTORY_VALUE_CELL_STYLE: React.CSSProperties = {
  padding: CELL_PADDING,
  minWidth: 0,
  wordBreak: "break-word",
};

const HISTORY_CURRENT_VALUE_CELL_STYLE: React.CSSProperties = {
  ...HISTORY_VALUE_CELL_STYLE,
  textAlign: "right",
};

const HISTORY_FULL_VALUE_CELL_STYLE: React.CSSProperties = {
  ...HISTORY_VALUE_CELL_STYLE,
  gridColumn: "3 / 6",
};

const HISTORY_REMOVED_VALUE_CELL_STYLE: React.CSSProperties = {
  ...HISTORY_FULL_VALUE_CELL_STYLE,
  color: "var(--mui-palette-text-disabled)",
};

const HISTORY_REMOVED_GROUP_VALUE_CELL_STYLE: React.CSSProperties = {
  ...HISTORY_FULL_VALUE_CELL_STYLE,
  color: COLOR_ERROR,
};

const HISTORY_ARROW_CELL_STYLE: React.CSSProperties = {
  padding: CELL_PADDING,
  textAlign: "center",
  alignSelf: "center",
  opacity: 0.6,
};

const HISTORY_UNCHANGED_VALUE_CELL_STYLE: React.CSSProperties = {
  ...HISTORY_FULL_VALUE_CELL_STYLE,
  color: "var(--mui-palette-text-disabled)",
};

export function HistoryFieldRowView({
  row,
  parentGroupChangeType,
  labels,
}: {
  row: HistoryFieldRow;
  parentGroupChangeType?: HistoryGroupChangeType;
  labels: VireoHistoryEntryLabels;
}): React.ReactElement {
  const isRemovedBecauseParentGroupWasRemoved = parentGroupChangeType === "removed";

  if (row.type === "removed") {
    const removedValueCellStyle = isRemovedBecauseParentGroupWasRemoved
      ? HISTORY_REMOVED_GROUP_VALUE_CELL_STYLE
      : HISTORY_REMOVED_VALUE_CELL_STYLE;

    return (
      <HistoryHoverableTableRow>
        <div style={HISTORY_ROW_GRID_STYLE}>
          <div style={{ ...HISTORY_DOT_CELL_STYLE, color: COLOR_ERROR }}>●</div>
          <div style={HISTORY_LABEL_CELL_STYLE}>{row.label}</div>

          <div style={removedValueCellStyle}>
            <HistoryValueContent
              removed
              removedColor={isRemovedBecauseParentGroupWasRemoved ? COLOR_ERROR : undefined}
              showMoreLabel={labels.showMore}
              showLessLabel={labels.showLess}
            >
              {row.previous}
            </HistoryValueContent>
          </div>
        </div>
      </HistoryHoverableTableRow>
    );
  }

  if (row.type === "added") {
    return (
      <HistoryHoverableTableRow>
        <div style={HISTORY_ROW_GRID_STYLE}>
          <div style={{ ...HISTORY_DOT_CELL_STYLE, color: COLOR_SUCCESS }}>●</div>
          <div style={HISTORY_LABEL_CELL_STYLE}>{row.label}</div>

          <div style={HISTORY_FULL_VALUE_CELL_STYLE}>
            <HistoryValueContent showMoreLabel={labels.showMore} showLessLabel={labels.showLess}>
              {row.current}
            </HistoryValueContent>
          </div>
        </div>
      </HistoryHoverableTableRow>
    );
  }

  if (row.type === "unchanged") {
    return (
      <HistoryHoverableTableRow>
        <div style={HISTORY_ROW_GRID_STYLE}>
          <div style={{ ...HISTORY_DOT_CELL_STYLE, color: "var(--mui-palette-text-disabled)" }}>●</div>
          <div style={HISTORY_LABEL_CELL_STYLE}>{row.label}</div>

          <div style={HISTORY_UNCHANGED_VALUE_CELL_STYLE}>
            <HistoryValueContent showMoreLabel={labels.showMore} showLessLabel={labels.showLess}>
              {row.current}
            </HistoryValueContent>
          </div>
        </div>
      </HistoryHoverableTableRow>
    );
  }

  return (
    <HistoryHoverableTableRow>
      <div style={HISTORY_ROW_GRID_STYLE}>
        <div
          style={{
            ...HISTORY_DOT_CELL_STYLE,
            color: row.type === "moved" ? COLOR_INFO : COLOR_WARN,
          }}
        >
          ●
        </div>

        <div style={HISTORY_LABEL_CELL_STYLE}>{row.label}</div>

        <div style={HISTORY_VALUE_CELL_STYLE}>
          <HistoryValueContent showMoreLabel={labels.showMore} showLessLabel={labels.showLess}>
            {row.previous}
          </HistoryValueContent>
        </div>

        <div style={HISTORY_ARROW_CELL_STYLE}>→</div>

        <div style={HISTORY_CURRENT_VALUE_CELL_STYLE}>
          <HistoryValueContent alignRight showMoreLabel={labels.showMore} showLessLabel={labels.showLess}>
            {row.current}
          </HistoryValueContent>
        </div>
      </div>
    </HistoryHoverableTableRow>
  );
}
