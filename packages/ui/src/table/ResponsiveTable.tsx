import { DesktopResponsiveTable } from "@/table/DesktopResponsiveTable";
import { MobileResponsiveTable } from "@/table/MobileResponsiveTable";
import {
  type ContainerLayout,
  type ResponsiveTableColumn,
  type ResponsiveTableProps,
  useResponsiveTableState,
} from "@/table/responsiveTableState";
import { Box } from "@mui/material";
import { memo, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

export type {
  ContainerLayout,
  ResponsiveTableColumn,
  ResponsiveTableFilters,
  ResponsiveTableLabels,
  ResponsiveTableLayers,
  ResponsiveTableMobileScrollAnchor,
  ResponsiveTableProps,
} from "@/table/responsiveTableState";

export type ContainerAwareRendererProps = {
  renderMobile: () => ReactNode;
  renderDesktop: () => ReactNode;
  layout?: ContainerLayout;
};

const MOBILE_WIDTH_BREAKPOINT = 601;
const MOBILE_HEIGHT_BREAKPOINT = 700;
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Chooses a compact or regular rendering from the component's own width. An
 * explicit layout keeps it aligned with a page-level layout decision.
 */
export const ContainerAwareRenderer = memo(function ContainerAwareRenderer({
  renderMobile,
  renderDesktop,
  layout: controlledLayout,
}: ContainerAwareRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<ContainerLayout | null>(null);
  const [layout, setLayout] = useState<ContainerLayout | null>(null);

  useBrowserLayoutEffect(() => {
    if (controlledLayout) {
      layoutRef.current = controlledLayout;
      return;
    }

    const container = containerRef.current;

    if (!container) return;

    const updateLayout = (contentWidth: number, contentHeight: number) => {
      const nextLayout: ContainerLayout =
        contentWidth < MOBILE_WIDTH_BREAKPOINT || contentHeight < MOBILE_HEIGHT_BREAKPOINT ? "mobile" : "desktop";

      if (layoutRef.current === nextLayout) return;

      layoutRef.current = nextLayout;
      setLayout(nextLayout);
    };

    updateLayout(container.clientWidth, container.clientHeight);

    const observer = new ResizeObserver(([entry]) => {
      const contentBoxSize = entry.contentBoxSize[0];
      updateLayout(
        contentBoxSize?.inlineSize ?? entry.contentRect.width,
        contentBoxSize?.blockSize ?? entry.contentRect.height,
      );
    });
    observer.observe(container, { box: "content-box" });
    return () => observer.disconnect();
  }, [controlledLayout]);

  const resolvedLayout = controlledLayout ?? layout;

  return (
    <Box
      ref={containerRef}
      data-container-layout={resolvedLayout ?? undefined}
      sx={{ height: "100%", minWidth: 0, width: "100%" }}
    >
      {resolvedLayout === "mobile" && renderMobile()}
      {resolvedLayout === "desktop" && renderDesktop()}
    </Box>
  );
});

export function ResponsiveTable<TItem, const TColumns extends readonly ResponsiveTableColumn<NoInfer<TItem>, string>[]>(
  tableProps: ResponsiveTableProps<TItem, TColumns>,
) {
  const state = useResponsiveTableState(tableProps);

  return (
    <ContainerAwareRenderer
      layout={tableProps.layout}
      renderMobile={() => <MobileResponsiveTable tableProps={tableProps} state={state} />}
      renderDesktop={() => <DesktopResponsiveTable tableProps={tableProps} state={state} />}
    />
  );
}
