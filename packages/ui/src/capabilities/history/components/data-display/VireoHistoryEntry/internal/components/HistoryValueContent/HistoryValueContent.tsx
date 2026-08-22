import React from "react";

export function HistoryValueContent({
  children,
  expanded,
  onOverflowChange,
  removed = false,
}: {
  children: React.ReactNode;
  expanded: boolean;
  onOverflowChange: (overflowing: boolean) => void;
  removed?: boolean;
}): React.ReactElement {
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const element = contentRef.current;
    if (element == null || expanded) return;

    const checkOverflow = () => {
      onOverflowChange(element.scrollHeight > element.clientHeight + 1);
    };

    checkOverflow();
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(checkOverflow);
    resizeObserver?.observe(element);

    return () => resizeObserver?.disconnect();
  }, [children, expanded, onOverflowChange]);

  return (
    <div
      ref={contentRef}
      className="VireoHistoryEntry-valueContent"
      data-expanded={expanded || undefined}
      data-removed={removed || undefined}
    >
      {children}
    </div>
  );
}
