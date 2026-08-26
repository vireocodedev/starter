import { type UtilityClassSlotMap, VireoLoadingRegion, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoResponsiveTableClassKey, getVireoResponsiveTableUtilityClass } from "./VireoResponsiveTable.classes";
import { VIREO_RESPONSIVE_TABLE_NAME, type VireoResponsiveTableSlotName } from "./VireoResponsiveTable.identity";
import { VireoResponsiveTableRoot } from "./VireoResponsiveTable.styled";
import type {
  VireoResponsiveTableColumn,
  VireoResponsiveTableLayout,
  VireoResponsiveTableOwnerState,
  VireoResponsiveTableProps,
} from "./VireoResponsiveTable.types";
import { DesktopResponsiveTable } from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/components/DesktopResponsiveTable/DesktopResponsiveTable";
import { MobileResponsiveTable } from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/components/MobileResponsiveTable/MobileResponsiveTable";
import { useVireoResponsiveTableState } from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/hooks/useVireoResponsiveTableState/useVireoResponsiveTableState";

const MOBILE_WIDTH_BREAKPOINT = 601;
const MOBILE_HEIGHT_BREAKPOINT = 700;
const useBrowserLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function useUtilityClasses(
  _ownerState: VireoResponsiveTableOwnerState,
  classes?: VireoResponsiveTableProps["classes"],
) {
  return composeClasses(
    { root: ["root"] } as const satisfies UtilityClassSlotMap<
      VireoResponsiveTableSlotName,
      VireoResponsiveTableClassKey
    >,
    getVireoResponsiveTableUtilityClass,
    classes,
  );
}

function VireoResponsiveTableImpl<
  TItem,
  const TColumns extends readonly VireoResponsiveTableColumn<NoInfer<TItem>, string>[],
>(inProps: VireoResponsiveTableProps<TItem, TColumns>, forwardedRef: React.ForwardedRef<HTMLDivElement>) {
  const props = useThemeProps({ props: inProps, name: VIREO_RESPONSIVE_TABLE_NAME });
  const {
    actionsColumn,
    className,
    classes: classesProp,
    columns,
    data,
    filters,
    filtersCount,
    filtersDoneLabel,
    filtersLabel,
    getRowKey,
    getRowSx,
    hasNextPage,
    initialExpandedMobileRowKey,
    initialMobileScrollAnchor,
    initialMobileScrollTop,
    isFetchingNextPage,
    labels,
    layers,
    layout: controlledLayout,
    onClearFilters,
    onExpandedMobileRowKeyChange,
    onFiltersChange,
    onLoadNextPage,
    onMobileFiltersDone,
    onMobileScrollTopChange,
    onOpenFilters,
    renderFilters,
    renderEmptyState,
    renderMobileFilters,
    renderMobileSearch,
    renderTitleEndAdornment,
    rowsPerPageOptions,
    size,
    skeleton = false,
    slotProps = {},
    slots = {},
    style,
    sx,
    titleColumn,
    titleEndAdornmentColumn,
    titleEndAdornmentHelperColumn,
    totalCount,
    clearFiltersLabel,
    ...other
  } = props;

  const tableProps: VireoResponsiveTableProps<TItem, TColumns> = {
    actionsColumn,
    columns,
    data,
    filters,
    filtersCount,
    filtersDoneLabel,
    filtersLabel,
    getRowKey,
    getRowSx,
    hasNextPage,
    initialExpandedMobileRowKey,
    initialMobileScrollAnchor,
    initialMobileScrollTop,
    isFetchingNextPage,
    labels,
    layers,
    layout: controlledLayout,
    onClearFilters,
    onExpandedMobileRowKeyChange,
    onFiltersChange,
    onLoadNextPage,
    onMobileFiltersDone,
    onMobileScrollTopChange,
    onOpenFilters,
    renderFilters,
    renderEmptyState,
    renderMobileFilters,
    renderMobileSearch,
    renderTitleEndAdornment,
    rowsPerPageOptions,
    size,
    skeleton,
    titleColumn,
    titleEndAdornmentColumn,
    titleEndAdornmentHelperColumn,
    totalCount,
    clearFiltersLabel,
  };
  const state = useVireoResponsiveTableState(tableProps);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const layoutRef = React.useRef<VireoResponsiveTableLayout | null>(null);
  const [measuredLayout, setMeasuredLayout] = React.useState<VireoResponsiveTableLayout | null>(null);

  useBrowserLayoutEffect(() => {
    if (controlledLayout) {
      layoutRef.current = controlledLayout;
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    const updateLayout = (width: number, height: number) => {
      const nextLayout: VireoResponsiveTableLayout =
        width < MOBILE_WIDTH_BREAKPOINT || height < MOBILE_HEIGHT_BREAKPOINT ? "mobile" : "desktop";
      if (layoutRef.current === nextLayout) return;
      layoutRef.current = nextLayout;
      setMeasuredLayout(nextLayout);
    };

    updateLayout(container.clientWidth, container.clientHeight);
    if (!globalThis.ResizeObserver) return;

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

  const layout = controlledLayout ?? measuredLayout;
  const ownerState: VireoResponsiveTableOwnerState = { layout, skeleton };
  const classes = useUtilityClasses(ownerState, classesProp);
  const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
  const {
    className: rootSlotClassName,
    ref: rootSlotRef,
    style: rootSlotStyle,
    sx: rootSlotSx,
    ...rootSlotOther
  } = resolvedRootSlotProps;
  const rootRef = useForkRef(forwardedRef, rootSlotRef, containerRef);

  return (
    <VireoResponsiveTableRoot
      {...other}
      {...rootSlotOther}
      as={slots.root ?? "div"}
      ref={rootRef}
      ownerState={ownerState}
      data-container-layout={layout ?? undefined}
      className={joinClassNames(classes.root, className, rootSlotClassName)}
      style={{ ...style, ...rootSlotStyle }}
      sx={mergeSx(sx, rootSlotSx)}
    >
      <VireoLoadingRegion loading={skeleton} loadingLabel={labels.loadingTable} sx={{ height: "100%", minHeight: 0 }}>
        {({ loadingVisible }) => (
          <>
            {layout === "mobile" && (
              <MobileResponsiveTable tableProps={tableProps} state={state} skeletonVisible={loadingVisible} />
            )}
            {layout === "desktop" && (
              <DesktopResponsiveTable tableProps={tableProps} state={state} skeletonVisible={loadingVisible} />
            )}
          </>
        )}
      </VireoLoadingRegion>
    </VireoResponsiveTableRoot>
  );
}

type VireoResponsiveTableComponent = {
  <TItem, const TColumns extends readonly VireoResponsiveTableColumn<NoInfer<TItem>, string>[]>(
    props: VireoResponsiveTableProps<TItem, TColumns> & React.RefAttributes<HTMLDivElement>,
  ): React.ReactElement | null;
  displayName?: string;
};

/**
 * Presents one typed data model as a container-aware desktop table or mobile accordion workflow.
 */
export const VireoResponsiveTable = React.forwardRef(VireoResponsiveTableImpl) as VireoResponsiveTableComponent;
VireoResponsiveTable.displayName = VIREO_RESPONSIVE_TABLE_NAME;
