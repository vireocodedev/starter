import { type RgoServerTable } from "@rgo/front-ui";
import type React from "react";

export type RgoServerTableProps<TElement> = React.ComponentProps<typeof RgoServerTable<TElement>>;
export type RgoServerTableColumn<TElement> = RgoServerTableProps<TElement>["columns"][number];
export type SortDirection = "asc" | "desc";
export type ActionsColumnAlign = "left" | "center" | "right";

export type RgoServerTableMobileProps<TElement> = RgoServerTableProps<TElement> & {
  filtersNode?: React.ReactNode;
  searchNode?: React.ReactNode;
  filtersCount?: number;
  onClearFilters?: () => void;
  onFiltersDone?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadNextPage?: () => void;
  defaultExpanded?: boolean;
  columnIdToUseAsTitle?: string;
  columnIdToUseAsActions?: string;
  actionsColumnAlign?: ActionsColumnAlign;
  titleEndAdornmentFn?: (element: TElement) => React.ReactNode;
};

export type ColumnRenderProps<TElement> = {
  element: TElement;
  index: number;
  rowIndex: number;
};

export type RgoServerTableColumnWithSort<TElement> = RgoServerTableColumn<TElement> & { sort: string };
