import {
  type ActionsColumnAlign,
  type ColumnRenderProps,
  type RgoServerTableColumn,
  type RgoServerTableColumnWithSort,
  type SortDirection,
} from "@/table/types";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import React from "react";

export const ACTIONS_COLUMN_JUSTIFY_CONTENT: Record<ActionsColumnAlign, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

export function getColumnId<TElement>(column: RgoServerTableColumn<TElement>): string {
  return String(column.id);
}

export function getColumnSort<TElement>(column: RgoServerTableColumn<TElement>): string | undefined {
  return column.sort ? String(column.sort) : undefined;
}

export function getSortDirection(sortDirection: unknown): SortDirection {
  return sortDirection === "desc" ? "desc" : "asc";
}

export function renderDirectionIcon(direction: SortDirection): React.ReactNode {
  return direction === "desc" ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />;
}

export function renderHeader<TElement>(column: RgoServerTableColumn<TElement>): React.ReactNode {
  const HeaderComponent = column.HeaderComponent as React.ComponentType;
  return <HeaderComponent />;
}

export function renderBody<TElement>(
  column: RgoServerTableColumn<TElement>,
  element: TElement,
  index: number,
): React.ReactNode {
  const BodyComponent = column.BodyComponent as React.ComponentType<ColumnRenderProps<TElement>>;
  return <BodyComponent element={element} index={index} rowIndex={index} />;
}

function findColumnById<TElement>(
  columns: RgoServerTableColumn<TElement>[],
  columnId: string | undefined,
): RgoServerTableColumn<TElement> | undefined {
  if (!columnId) {
    return undefined;
  }

  return columns.find(column => getColumnId(column) === columnId);
}

export function getTitleColumn<TElement>(
  columns: RgoServerTableColumn<TElement>[],
  columnIdToUseAsTitle: string | undefined,
): RgoServerTableColumn<TElement> | undefined {
  return findColumnById(columns, columnIdToUseAsTitle) ?? columns[0];
}

export function getActionColumn<TElement>(
  columns: RgoServerTableColumn<TElement>[],
  columnIdToUseAsActions: string | undefined,
): RgoServerTableColumn<TElement> | undefined {
  return findColumnById(columns, columnIdToUseAsActions);
}

export function getDetailColumns<TElement>(
  columns: RgoServerTableColumn<TElement>[],
  titleColumn: RgoServerTableColumn<TElement> | undefined,
  actionColumn: RgoServerTableColumn<TElement> | undefined,
): RgoServerTableColumn<TElement>[] {
  const titleColumnId = titleColumn ? getColumnId(titleColumn) : undefined;
  const actionColumnId = actionColumn ? getColumnId(actionColumn) : undefined;
  const detailColumns = columns.filter(column => {
    const columnId = getColumnId(column);
    return columnId !== titleColumnId && columnId !== actionColumnId;
  });

  return actionColumn ? [...detailColumns, actionColumn] : detailColumns;
}

export function getSortableColumns<TElement>(
  columns: RgoServerTableColumn<TElement>[],
): RgoServerTableColumnWithSort<TElement>[] {
  return columns.filter(column => Boolean(getColumnSort(column))) as RgoServerTableColumnWithSort<TElement>[];
}

export function validateFiltersCount(filtersCount: number | undefined): number {
  const value = filtersCount ?? 0;

  if (!Number.isInteger(value) || value < 0) {
    throw new Error("RgoServerTableMobile filtersCount must be a non-negative integer.");
  }

  return value;
}
