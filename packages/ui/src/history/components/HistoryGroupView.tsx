import { HistoryFieldRowView } from "@/history/components/HistoryFieldRowView";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Box, Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { type HistoryGroupChangeType, type HistoryGroupNode, type HistoryNode } from "@vireocodedev/starter-history";
import { useHistoryTranslation } from "@vireocodedev/starter-localization";
import { useEffect, useState } from "react";

const TABLE_BORDER_COLOR = "var(--mui-palette-grey-300)";

const CELL_GROUP_HEADER_FONT_COLOR = "var(--mui-palette-text-secondary)";

const HISTORY_NESTED_GROUP_CELL_STYLE: React.CSSProperties = {
  padding: "0 8px 8px 8px",
};

const HISTORY_NESTED_TABLE_STYLE: React.CSSProperties = {
  width: "100%",
  fontFamily: "monospace",
  lineHeight: 1.125,
  border: `1px solid ${TABLE_BORDER_COLOR}`,
  borderRadius: 8,
  overflow: "hidden",
};

const HISTORY_ROOT_META_STYLE: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 400,
  color: CELL_GROUP_HEADER_FONT_COLOR,
  whiteSpace: "nowrap",
};

const HISTORY_ENTITY_HEADER_STYLE: React.CSSProperties = {
  fontWeight: 500,
  fontSize: "0.85em",
  whiteSpace: "nowrap",
};

const HISTORY_GROUP_VALUE_STYLE: React.CSSProperties = {
  fontWeight: 400,
  opacity: 0.7,
};

const HISTORY_HEADER_STYLE: React.CSSProperties = {
  textAlign: "left",
  padding: "6px 8px",
  fontWeight: 600,
  backgroundColor: "var(--mui-palette-grey-200)",
  color: CELL_GROUP_HEADER_FONT_COLOR,
  display: "flex",
};

const HISTORY_HEADER_CONTENT_STYLE: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  flex: 1,
};

const HISTORY_GROUP_TITLE_STYLE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  minWidth: 0,
  flexWrap: "nowrap",
};

const HISTORY_GROUP_STATUS_DOT_STYLE: React.CSSProperties = {
  width: 9,
  height: 9,
  borderRadius: "50%",
  flex: "0 0 auto",
};

const HISTORY_GROUP_VALUE_SEPARATOR_STYLE: React.CSSProperties = {
  ...HISTORY_GROUP_VALUE_STYLE,
};

const HISTORY_REMOVED_GROUP_VALUE_TEXT_STYLE: React.CSSProperties = {
  ...HISTORY_GROUP_VALUE_STYLE,
  color: "var(--mui-palette-error-main)",
  opacity: 1,
  textDecoration: "line-through",
};

const DEFAULT_EXPANDED_DEPTH = 3;

const HISTORY_GROUP_HEADER_LEFT_STYLE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  minWidth: 0,
  flexWrap: "wrap",
};

const HISTORY_GROUP_HEADER_LEFT_CLICKABLE_STYLE: React.CSSProperties = {
  ...HISTORY_GROUP_HEADER_LEFT_STYLE,
  cursor: "pointer",
  userSelect: "none",
};

const HISTORY_GROUP_HEADER_BUTTON_STYLE: React.CSSProperties = {
  textTransform: "none",
  minWidth: "fit-content",
  marginLeft: "auto",
  color: "var(--mui-palette-primary-400)",
  fontSize: "0.75em",
};

const HISTORY_GROUP_TOGGLE_BUTTON_STYLE: React.CSSProperties = {
  width: 22,
  height: 22,
  padding: 0,
  marginLeft: -4,
  color: CELL_GROUP_HEADER_FONT_COLOR,
};

function getHistoryGroupStatusDotColor(changeType: HistoryGroupChangeType | undefined): string | undefined {
  switch (changeType) {
    case "added":
      return "var(--mui-palette-success-main)";

    case "updated":
      return "var(--mui-palette-warning-main)";

    case "removed":
      return "var(--mui-palette-error-main)";

    case "unchanged":
      return "var(--mui-palette-text-disabled)";

    default:
      return undefined;
  }
}

function HistoryGroupStatusDot({
  changeType,
}: {
  changeType: HistoryGroupChangeType | undefined;
}): React.ReactElement | null {
  const backgroundColor = getHistoryGroupStatusDotColor(changeType);

  if (backgroundColor == null) {
    return null;
  }

  return (
    <span
      style={{
        ...HISTORY_GROUP_STATUS_DOT_STYLE,
        backgroundColor,
      }}
    />
  );
}

function HistoryGroupToggleButton({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}): React.ReactElement {
  return (
    <IconButton
      type="button"
      size="small"
      aria-label={expanded ? "Collapse section" : "Expand section"}
      aria-expanded={expanded}
      onClick={event => {
        event.stopPropagation();
        onToggle();
      }}
      style={HISTORY_GROUP_TOGGLE_BUTTON_STYLE}
    >
      {expanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
    </IconButton>
  );
}

function HistoryGroupTitle({ group }: { group: HistoryGroupNode }): React.ReactElement {
  const groupValueStyle =
    group.changeType === "removed" ? HISTORY_REMOVED_GROUP_VALUE_TEXT_STYLE : HISTORY_GROUP_VALUE_STYLE;

  return (
    <span style={HISTORY_GROUP_TITLE_STYLE}>
      <HistoryGroupStatusDot changeType={group.changeType} />

      <span style={HISTORY_ENTITY_HEADER_STYLE}>{group.label}</span>

      {group.value == null ? null : (
        <>
          <span style={HISTORY_GROUP_VALUE_SEPARATOR_STYLE}> · </span>
          <span style={groupValueStyle}>{group.value}</span>
        </>
      )}
    </span>
  );
}

function hasVisibleHistoryNodeChanges(node: HistoryNode, showUnchanged: boolean): boolean {
  if (node.type === "group") {
    return node.children.some(child => hasVisibleHistoryNodeChanges(child, showUnchanged));
  }

  return showUnchanged || node.type !== "unchanged";
}

export function HistoryGroupView({
  group,
  rootMeta,
  showRootEntityLabel = false,
  depth = 1,
  defaultExpandedDepth = DEFAULT_EXPANDED_DEPTH,
  defaultShowUnchanged = false,
  inheritedShowUnchanged,
}: {
  group: HistoryGroupNode;
  rootMeta?: React.ReactNode;
  showRootEntityLabel?: boolean;
  depth?: number;
  defaultExpandedDepth?: number;
  defaultShowUnchanged?: boolean;
  inheritedShowUnchanged?: boolean;
}): React.ReactElement | null {
  const { t } = useHistoryTranslation();
  const isRootGroup = rootMeta != null;
  const groupKey = group.path.join(".") || "$root";

  const [expanded, setExpanded] = useState(() => depth <= defaultExpandedDepth);
  const [rootShowUnchanged, setRootShowUnchanged] = useState(defaultShowUnchanged);

  useEffect(() => {
    setExpanded(depth <= defaultExpandedDepth);
  }, [groupKey, depth, defaultExpandedDepth]);

  useEffect(() => {
    if (isRootGroup) {
      setRootShowUnchanged(defaultShowUnchanged);
    }
  }, [groupKey, defaultShowUnchanged, isRootGroup]);

  const showUnchanged = isRootGroup ? rootShowUnchanged : inheritedShowUnchanged ?? defaultShowUnchanged;

  const toggleButton = (
    <HistoryGroupToggleButton expanded={expanded} onToggle={() => setExpanded(current => !current)} />
  );

  const toggleExpanded = () => {
    setExpanded(current => !current);
  };

  const visibleChildren = group.children.filter(child => hasVisibleHistoryNodeChanges(child, showUnchanged));

  if (!isRootGroup && visibleChildren.length === 0) {
    return null;
  }

  return (
    <div style={HISTORY_NESTED_TABLE_STYLE}>
      <div style={HISTORY_HEADER_STYLE}>
        <div style={HISTORY_HEADER_CONTENT_STYLE}>
          <span
            role="button"
            tabIndex={0}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse section" : "Expand section"}
            onClick={toggleExpanded}
            onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleExpanded();
              }
            }}
            style={HISTORY_GROUP_HEADER_LEFT_CLICKABLE_STYLE}
          >
            {toggleButton}
            {isRootGroup ? <span style={HISTORY_ROOT_META_STYLE}>{rootMeta}</span> : null}
            {isRootGroup ? (
              showRootEntityLabel ? (
                <HistoryGroupTitle group={group} />
              ) : null
            ) : (
              <HistoryGroupTitle group={group} />
            )}
          </span>

          {isRootGroup ? (
            <Button
              size="small"
              type="button"
              onClick={() => setRootShowUnchanged(current => !current)}
              style={HISTORY_GROUP_HEADER_BUTTON_STYLE}
            >
              {showUnchanged ? t("hideUnchanged") : t("showUnchanged")}
            </Button>
          ) : null}
        </div>
      </div>

      {expanded ? (
        <Box
          className="group"
          sx={{
            "& > .group__item:first-of-type": {
              paddingTop: "8px !important",
            },
          }}
        >
          {visibleChildren.map(child => {
            if (child.type === "group") {
              return (
                <div
                  className="group__item"
                  key={child.path.join(".") || "$group"}
                  style={HISTORY_NESTED_GROUP_CELL_STYLE}
                >
                  <HistoryGroupView
                    group={child}
                    depth={depth + 1}
                    defaultExpandedDepth={defaultExpandedDepth}
                    defaultShowUnchanged={defaultShowUnchanged}
                    inheritedShowUnchanged={showUnchanged}
                  />
                </div>
              );
            }

            return (
              <HistoryFieldRowView
                key={child.path.join(".") || "$row"}
                row={child}
                parentGroupChangeType={group.changeType}
              />
            );
          })}
        </Box>
      ) : null}
    </div>
  );
}
