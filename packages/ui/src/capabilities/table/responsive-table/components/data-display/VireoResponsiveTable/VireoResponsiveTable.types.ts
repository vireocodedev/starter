import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { Key, ReactNode } from "react";
import { type VireoResponsiveTableClasses, type VireoResponsiveTableClassKey } from "./VireoResponsiveTable.classes";
import type { VIREO_RESPONSIVE_TABLE_NAME, VireoResponsiveTableSlotName } from "./VireoResponsiveTable.identity";

export type VireoResponsiveTableLayout = "mobile" | "desktop";
export type VireoResponsiveTableSortDirection = "asc" | "desc";
export type VireoResponsiveTableCellPlacement = "desktop" | "mobile-summary" | "mobile-detail";

export type VireoResponsiveTableCellContext = { placement: VireoResponsiveTableCellPlacement };

export type VireoResponsiveTableColumn<TItem, TId extends string = string> = {
  id: TId;
  renderHeader: () => ReactNode;
  renderBody: (item: TItem, rowIndex: number, context: VireoResponsiveTableCellContext) => ReactNode;
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

type VireoResponsiveTableColumnId<TColumns extends readonly { id: string }[]> = TColumns[number]["id"];

export type VireoResponsiveTableFilters = {
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDirection: VireoResponsiveTableSortDirection;
};

export type VireoResponsiveTableLabels = {
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

export type VireoResponsiveTableLayers = { stickyToolbar: number; stickyRowHeader: number };

export type VireoResponsiveTableMobileScrollAnchor = { rowKey: Key; offsetTop: number; rowIndex: number };

export type VireoResponsiveTableOwnerState = {
  layout: VireoResponsiveTableLayout | null;
  skeleton: boolean;
};

export interface VireoResponsiveTableRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export type VireoResponsiveTableSlots = {
  [TSlotName in VireoResponsiveTableSlotName]: React.ElementType;
};

export type VireoResponsiveTableSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoResponsiveTableSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoResponsiveTableRootSlotPropsOverrides, VireoResponsiveTableOwnerState>;
  }
>;

export type VireoResponsiveTableOwnProps<
  TItem,
  TColumns extends readonly VireoResponsiveTableColumn<NoInfer<TItem>, string>[],
> = VireoResponsiveTableSlotsAndSlotProps & {
  columns: TColumns;
  data: readonly TItem[];
  filters: VireoResponsiveTableFilters;
  onFiltersChange: (filters: VireoResponsiveTableFilters) => void;
  labels: VireoResponsiveTableLabels;
  layers: VireoResponsiveTableLayers;
  renderFilters?: () => ReactNode;
  renderMobileFilters?: () => ReactNode;
  skeleton?: boolean;
  titleColumn?: VireoResponsiveTableColumnId<TColumns>;
  titleEndAdornmentColumn?: VireoResponsiveTableColumnId<TColumns>;
  titleEndAdornmentHelperColumn?: VireoResponsiveTableColumnId<TColumns>;
  actionsColumn?: VireoResponsiveTableColumnId<TColumns>;
  getRowKey?: (item: TItem, rowIndex: number) => Key;
  totalCount?: number;
  renderMobileSearch?: () => ReactNode;
  filtersCount?: number;
  onClearFilters?: () => void;
  onOpenFilters?: () => void;
  onMobileFiltersDone?: () => void;
  renderTitleEndAdornment?: (item: TItem, rowIndex: number) => ReactNode;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadNextPage?: () => void;
  filtersLabel?: string;
  clearFiltersLabel?: string;
  filtersDoneLabel?: string;
  rowsPerPageOptions?: readonly number[];
  size?: "small" | "medium";
  initialMobileScrollTop?: number;
  initialMobileScrollAnchor?: VireoResponsiveTableMobileScrollAnchor;
  onMobileScrollTopChange?: (scrollTop: number, anchor?: VireoResponsiveTableMobileScrollAnchor) => void;
  initialExpandedMobileRowKey?: Key | null;
  onExpandedMobileRowKeyChange?: (rowKey: Key | null) => void;
  /** Keeps the table in lockstep with an enclosing responsive layout when provided. */
  layout?: VireoResponsiveTableLayout;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoResponsiveTableClasses>;
};

export type VireoResponsiveTableInheritedProps = Omit<BoxProps<"div">, "children" | "component">;

export type VireoResponsiveTableProps<
  TItem = unknown,
  TColumns extends readonly VireoResponsiveTableColumn<NoInfer<TItem>, string>[] = readonly VireoResponsiveTableColumn<
    NoInfer<TItem>,
    string
  >[],
> = VireoResponsiveTableOwnProps<TItem, TColumns> & VireoResponsiveTableInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_RESPONSIVE_TABLE_NAME]?: VireoThemeComponent<
      VireoResponsiveTableProps,
      VireoResponsiveTableClassKey,
      VireoResponsiveTableOwnerState,
      Theme
    >;
  }
}
