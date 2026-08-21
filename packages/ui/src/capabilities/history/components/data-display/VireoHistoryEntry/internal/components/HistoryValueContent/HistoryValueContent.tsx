import React from "react";

const CLAMPED_VALUE_CONTENT_STYLE: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const SHOW_MODE_BUTTON_STYLE: React.CSSProperties = {
  border: 0,
  padding: 0,
  background: "transparent",
  color: "var(--mui-palette-primary-main)",
  cursor: "pointer",
  font: "inherit",
  fontSize: 12,
  whiteSpace: "nowrap",
};

export function HistoryValueContent({
  children,
  removed = false,
  alignRight = false,
  removedColor,
  showMoreLabel,
  showLessLabel,
}: {
  children: React.ReactNode;
  removed?: boolean;
  alignRight?: boolean;
  removedColor?: string;
  showMoreLabel: string;
  showLessLabel: string;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [canExpand, setCanExpand] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const element = contentRef.current;

    if (element == null || expanded) {
      return;
    }

    const checkOverflow = () => {
      setCanExpand(element.scrollHeight > element.clientHeight + 1);
    };

    checkOverflow();

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(checkOverflow);

    resizeObserver?.observe(element);

    return () => {
      resizeObserver?.disconnect();
    };
  }, [children, expanded]);

  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
      }}
    >
      <div
        ref={contentRef}
        style={{
          ...(expanded ? undefined : CLAMPED_VALUE_CONTENT_STYLE),
          width: "100%",
          minWidth: 0,
          textAlign: alignRight ? "right" : "left",
          overflowWrap: "break-word",
          color: removed ? (removedColor ?? "var(--mui-palette-text-secondary)") : undefined,
          textDecoration: removed ? "line-through" : undefined,
        }}
      >
        {children}
      </div>

      {canExpand ? (
        <button type="button" onClick={() => setExpanded(current => !current)} style={SHOW_MODE_BUTTON_STYLE}>
          {expanded ? showLessLabel : showMoreLabel}
        </button>
      ) : null}
    </div>
  );
}
