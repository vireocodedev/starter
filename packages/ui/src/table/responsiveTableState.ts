import { type DtSortDirection } from "@/components/data-display/RgoTable";
import React, { type Key, type ReactNode } from "react";

const DEFAULT_COLUMN_WIDTH = 180;

export type ContainerLayout = "mobile" | "desktop";

export type ResponsiveTableColumn<TItem, TId extends string = string> = {
  id: TId;
  renderHeader: () => ReactNode;
  renderBody: (item: TItem, rowIndex: number) => ReactNode;
  align?: "left" | "center" | "right";
  /** Arbitrary frontend or backend sort identifier. */
  sort?: string;
  sticky?: "left" | "right" | false;
  minWidthPx?: number;
  /** Pins the column to exactly `minWidthPx` so it never absorbs leftover space. */
  fixedWidth?: boolean;
  /** Required for predictable cumulative offsets when columns are sticky. */
  width?: number;
};

type ResponsiveTableColumnId<TColumns extends readonly { id: string }[]> = TColumns[number]["id"];

export type ResponsiveTableFilters = {
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDirection: DtSortDirection;
};

export type ResponsiveTableLabels = {
  table: string;
  loadingTable: string;
  noData: string;
  showMore: string;
  showLess: string;
  rowsPerPage: string;
  paginationMoreThan: (from: number, to: number) => string;
  paginationRange: (from: number, to: number, count: number) => string;
  paginationItem: (type: "first" | "last" | "next" | "previous") => string;
  filters: string;
  clearFilters: string;
  filtersDone: string;
  sortBy: string;
  sortDirection: string;
  ascending: string;
  descending: string;
  ascendingSortDirection: string;
  descendingSortDirection: string;
};

export type ResponsiveTableLayers = {
  stickyToolbar: number;
  stickyRowHeader: number;
};

export type ResponsiveTableMobileScrollAnchor = {
  rowKey: Key;
  offsetTop: number;
  rowIndex: number;
};

export type ResponsiveTableProps<TItem, TColumns extends readonly ResponsiveTableColumn<NoInfer<TItem>, string>[]> = {
  columns: TColumns;
  data: readonly TItem[];
  filters: ResponsiveTableFilters;
  onFiltersChange: (filters: ResponsiveTableFilters) => void;
  labels: ResponsiveTableLabels;
  layers: ResponsiveTableLayers;
  /** Renders immediately above the desktop table. */
  renderFilters?: () => ReactNode;
  /** Renders immediately above the mobile accordion list. */
  renderMobileFilters?: () => ReactNode;
  /** Replaces data content with a layout-matched loading state. */
  skeleton?: boolean;
  titleColumn?: ResponsiveTableColumnId<TColumns>;
  titleEndAdornmentColumn?: ResponsiveTableColumnId<TColumns>;
  titleEndAdornmentHelperColumn?: ResponsiveTableColumnId<TColumns>;
  actionsColumn?: ResponsiveTableColumnId<TColumns>;
  getRowKey?: (item: TItem, rowIndex: number) => Key;
  /** Row count across all pages. Required whenever the caller paginates server-side. */
  totalCount?: number;
  /** Renders above the mobile filter bar, outside the collapsible panel. */
  renderMobileSearch?: () => ReactNode;
  filtersCount?: number;
  onClearFilters?: () => void;
  /** Opens the caller's own filters surface. Takes precedence over the built-in collapsible panel. */
  onOpenFilters?: () => void;
  onMobileFiltersDone?: () => void;
  /** Takes precedence over titleEndAdornmentColumn. */
  renderTitleEndAdornment?: (item: TItem, rowIndex: number) => ReactNode;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadNextPage?: () => void;
  filtersLabel?: string;
  clearFiltersLabel?: string;
  filtersDoneLabel?: string;
  rowsPerPageOptions?: readonly number[];
  /** Row density of the desktop table; the compact layout is unaffected. */
  size?: "small" | "medium";
  initialMobileScrollTop?: number;
  initialMobileScrollAnchor?: ResponsiveTableMobileScrollAnchor;
  onMobileScrollTopChange?: (scrollTop: number, anchor?: ResponsiveTableMobileScrollAnchor) => void;
  initialExpandedMobileRowKey?: Key | null;
  onExpandedMobileRowKeyChange?: (rowKey: Key | null) => void;
  /** Keeps the table in lockstep with its page's compact/regular layout decision. */
  layout?: ContainerLayout;
};

type StickyCellSx = {
  boxSizing: "border-box";
  position?: "sticky";
  top?: number;
  zIndex?: number;
  bgcolor?: string;
  left?: number;
  right?: number;
  boxShadow?: string;
};

export type ResponsiveTableState<TItem> = {
  rowsPerPageOptions: number[];
  skeletonPlaceholderCount: number;
  desktopPageRows: readonly TItem[];
  orderedColumns: readonly ResponsiveTableColumn<TItem, string>[];
  desktopColumnWidths: { byId: Map<string, string>; tableWidth: number };
  endAdornmentColumn?: ResponsiveTableColumn<TItem, string>;
  helperColumn?: ResponsiveTableColumn<TItem, string>;
  resolvedActionsColumn?: ResponsiveTableColumn<TItem, string>;
  resolvedTitleColumn?: ResponsiveTableColumn<TItem, string>;
  mobileDetailColumns: readonly ResponsiveTableColumn<TItem, string>[];
  sortableColumns: readonly ResponsiveTableColumn<TItem, string>[];
  getStickyCellSx: (column: ResponsiveTableColumn<TItem, string>, isHeader: boolean) => StickyCellSx;
  handleSort: (sortBy: string) => void;
  handleMobileSortColumnChange: (sortBy: string) => void;
  handleMobileSortDirectionChange: (sortDirection: DtSortDirection | null) => void;
};

function getColumnLayoutWidth(column: { minWidthPx?: number; width?: number; fixedWidth?: boolean }) {
  if (column.fixedWidth) {
    return column.minWidthPx ?? column.width ?? DEFAULT_COLUMN_WIDTH;
  }

  const preferredWidth = column.width ?? column.minWidthPx ?? DEFAULT_COLUMN_WIDTH;
  return Math.max(preferredWidth, column.minWidthPx ?? 0);
}

/** Pinned and explicitly sized columns keep their exact width; the rest absorb the leftover space. */
function isFixedColumn(column: { sticky?: "left" | "right" | false; width?: number; fixedWidth?: boolean }) {
  return Boolean(column.sticky) || column.fixedWidth === true || column.width !== undefined;
}

export function useResponsiveTableState<
  TItem,
  const TColumns extends readonly ResponsiveTableColumn<NoInfer<TItem>, string>[],
>({
  actionsColumn,
  columns,
  data,
  filters,
  onFiltersChange,
  rowsPerPageOptions: rowsPerPageOptionsProp,
  titleColumn,
  titleEndAdornmentColumn,
  titleEndAdornmentHelperColumn,
}: Pick<
  ResponsiveTableProps<TItem, TColumns>,
  | "actionsColumn"
  | "columns"
  | "data"
  | "filters"
  | "onFiltersChange"
  | "rowsPerPageOptions"
  | "titleColumn"
  | "titleEndAdornmentColumn"
  | "titleEndAdornmentHelperColumn"
>): ResponsiveTableState<TItem> {
  const rowsPerPageOptions = React.useMemo(() => {
    const options = [...(rowsPerPageOptionsProp ?? [10, 20, 50, 100]), filters.rowsPerPage];
    return [...new Set(options)].sort((a, b) => a - b);
  }, [filters.rowsPerPage, rowsPerPageOptionsProp]);

  const skeletonPlaceholderCount = Math.min(Math.max(filters.rowsPerPage, 3), 100);

  const desktopPageRows = React.useMemo(() => {
    if (data.length <= filters.rowsPerPage) return data;
    const firstRow = filters.page * filters.rowsPerPage;
    return data.slice(firstRow, firstRow + filters.rowsPerPage);
  }, [data, filters.page, filters.rowsPerPage]);

  const orderedColumns = React.useMemo(() => {
    const ids = new Set<string>();
    for (const column of columns) {
      if (ids.has(column.id)) throw new Error(`ResponsiveTable column id "${column.id}" is duplicated.`);
      ids.add(column.id);
    }

    return [
      ...columns.filter(column => column.sticky === "left"),
      ...columns.filter(column => !column.sticky),
      ...columns.filter(column => column.sticky === "right"),
    ] as readonly ResponsiveTableColumn<TItem, string>[];
  }, [columns]);

  const tableLayout = React.useMemo(() => {
    const leftOffsets = new Map<string, number>();
    const rightOffsets = new Map<string, number>();
    let left = 0;
    let right = 0;

    for (const column of orderedColumns) {
      if (column.sticky === "left") {
        leftOffsets.set(column.id, left);
        left += getColumnLayoutWidth(column);
      }
    }
    for (const column of [...orderedColumns].reverse()) {
      if (column.sticky === "right") {
        rightOffsets.set(column.id, right);
        right += getColumnLayoutWidth(column);
      }
    }

    return {
      leftOffsets,
      rightOffsets,
      totalWidth: orderedColumns.reduce((sum, column) => sum + getColumnLayoutWidth(column), 0),
      fixedWidth: orderedColumns.reduce(
        (sum, column) => (isFixedColumn(column) ? sum + getColumnLayoutWidth(column) : sum),
        0,
      ),
      flexibleWidth: orderedColumns.reduce(
        (sum, column) => (isFixedColumn(column) ? sum : sum + getColumnLayoutWidth(column)),
        0,
      ),
      lastLeftId: orderedColumns.filter(column => column.sticky === "left").at(-1)?.id,
      firstRightId: orderedColumns.find(column => column.sticky === "right")?.id,
    };
  }, [orderedColumns]);

  const desktopColumnWidths = React.useMemo(() => {
    const { fixedWidth, flexibleWidth, totalWidth } = tableLayout;
    const byId = new Map<string, string>();
    for (const column of orderedColumns) {
      const layoutWidth = getColumnLayoutWidth(column);
      byId.set(
        column.id,
        isFixedColumn(column) || flexibleWidth === 0
          ? `${layoutWidth}px`
          : `max(${layoutWidth}px, calc((100% - ${fixedWidth}px) * ${layoutWidth / flexibleWidth}))`,
      );
    }
    return { byId, tableWidth: totalWidth };
  }, [orderedColumns, tableLayout]);

  const columnById = React.useMemo(() => new Map(orderedColumns.map(column => [column.id, column])), [orderedColumns]);
  const resolvedTitleColumn =
    columnById.get(titleColumn ?? "") ?? orderedColumns.find(column => column.id !== actionsColumn);
  const endAdornmentColumn = columnById.get(titleEndAdornmentColumn ?? "");
  const helperColumn = columnById.get(titleEndAdornmentHelperColumn ?? "");
  const resolvedActionsColumn = columnById.get(actionsColumn ?? "");
  const mobileDetailColumns = React.useMemo(
    () => orderedColumns.filter(column => column.id !== resolvedActionsColumn?.id),
    [orderedColumns, resolvedActionsColumn?.id],
  );
  const sortableColumns = React.useMemo(
    () => orderedColumns.filter(column => Boolean(column.sort?.trim())),
    [orderedColumns],
  );

  const getStickyCellSx = React.useCallback(
    (column: ResponsiveTableColumn<TItem, string>, isHeader: boolean): StickyCellSx => {
      const isSticky = Boolean(column.sticky);
      const edgeShadow =
        column.id === tableLayout.lastLeftId
          ? "4px 0 8px -6px rgba(15, 23, 42, 0.42)"
          : column.id === tableLayout.firstRightId
            ? "-4px 0 8px -6px rgba(15, 23, 42, 0.42)"
            : undefined;

      return {
        boxSizing: "border-box",
        ...(isHeader && {
          position: "sticky" as const,
          top: 0,
          zIndex: isSticky ? 5 : 3,
          bgcolor: "surface.sunken",
        }),
        ...(isSticky && {
          position: "sticky" as const,
          left: column.sticky === "left" ? tableLayout.leftOffsets.get(column.id) : undefined,
          right: column.sticky === "right" ? tableLayout.rightOffsets.get(column.id) : undefined,
          zIndex: isHeader ? 5 : 2,
          bgcolor: isHeader ? "surface.sunken" : "surface.base",
          boxShadow: edgeShadow,
        }),
      };
    },
    [tableLayout],
  );

  const handleSort = React.useCallback(
    (sortBy: string) => {
      const isActive = filters.sortBy === sortBy;
      onFiltersChange({
        ...filters,
        page: 0,
        sortBy,
        sortDirection: isActive && filters.sortDirection === "asc" ? "desc" : "asc",
      });
    },
    [filters, onFiltersChange],
  );
  const handleMobileSortColumnChange = React.useCallback(
    (sortBy: string) => onFiltersChange({ ...filters, page: 0, sortBy }),
    [filters, onFiltersChange],
  );
  const handleMobileSortDirectionChange = React.useCallback(
    (sortDirection: DtSortDirection | null) => {
      if (sortDirection) onFiltersChange({ ...filters, page: 0, sortDirection });
    },
    [filters, onFiltersChange],
  );

  return {
    rowsPerPageOptions,
    skeletonPlaceholderCount,
    desktopPageRows,
    orderedColumns,
    desktopColumnWidths,
    endAdornmentColumn,
    helperColumn,
    resolvedActionsColumn,
    resolvedTitleColumn,
    mobileDetailColumns,
    sortableColumns,
    getStickyCellSx,
    handleSort,
    handleMobileSortColumnChange,
    handleMobileSortDirectionChange,
  };
}
