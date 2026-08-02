import { type PageableParams } from "@/utils/apiutils";
import { type ReactStateSetter, type TODO } from "@/utils/typeutils";
import type React from "react";

export type DtSortDirection = "asc" | "desc";

export type DtRowsPerPageOptions = readonly number[];

export type DtBaseColumnAlign = "left" | "center" | "right";

export type DtBaseSortItem = { id: string; direction: DtSortDirection };

export type DtBaseProps<T> = {
  data: T[];
  isRowExpandable?: (element: T) => boolean;
  AccordionComponent?: React.ComponentType<{ element: T }>;
  size?: "small" | "medium";
  className?: string;
  highlighted?: (element: T) => boolean;
  stickyMaxHeight?: string | number;
  paperClassName?: string;
  noDataMessage?: React.ReactNode;
  keyMapper: (element: T) => React.Key;
  disableHeader?: boolean;
};

export type DtBaseColumn<TItem, TSort = unknown> = {
  id: string;
  HeaderComponent: React.ComponentType;
  BodyComponent: React.ComponentType<{ element: TItem; index: number }>;
  align?: DtBaseColumnAlign;
  sort?: TSort;
  widthPctShare: number;
  widthPxMin: number;
  sticky?: "left" | "right" | false;
};

export function calculateStickySx(
  columns: DtBaseColumn<TODO, TODO>[],
  index: number,
  accordionButtonOffset: number | undefined | null = 0,
  isHeader: boolean,
  forceBackgroundInherit: boolean = false,
) {
  const column = columns[index];
  const sticky = column?.sticky;

  if (!sticky) return {} as const;

  //const accordionButtonOffset = areRowsExpandable ? 67 : 0; // the width of the accordion button cell

  const includeBoxShadow =
    sticky === "left" ? columns[index + 1]?.sticky !== "left" : columns[index - 1]?.sticky !== "right";

  const boxShadow = includeBoxShadow
    ? sticky === "left"
      ? "2px 0 0 rgba(0,0,0,0.08)"
      : "-2px 0 0 rgba(0,0,0,0.08)"
    : undefined;

  const offsetPx =
    sticky === "left"
      ? columns
          .slice(0, index)
          .filter(col => col.sticky === "left")
          .reduce((acc, col) => acc + col.widthPxMin, accordionButtonOffset ?? 0)
      : columns
          .slice(index + 1)
          .filter(col => col.sticky === "right")
          .reduce((acc, col) => acc + col.widthPxMin, 0);

  return {
    position: "sticky",
    [sticky === "left" ? "left" : "right"]: `${offsetPx}px`,
    zIndex: isHeader ? 4 : 3,
    boxShadow,
    minWidth: `${column.widthPxMin}px`,
    maxWidth: `${column.widthPxMin}px`,
    backgroundColor: forceBackgroundInherit
      ? "inherit !important"
      : isHeader
        ? undefined
        : "var(--mui-palette-background-default)",
  } as const;
}

export type PaginationProps = {
  pagination: PageableParams;
  onPaginationChange: ReactStateSetter<PageableParams>;
  rowsPerPageOptions?: DtRowsPerPageOptions;
};

export const DEFAULT_PAGINATION_OPTIONS: PageableParams = {
  page: 0,
  rowsPerPage: 10,
  sortBy: "",
  sortDirection: "asc",
};

export * from "./components/RgoTableCellSortable/RgoTableCellSortable";
export * from "./components/RgoTablePagination/RgoTablePagination";
export * from "./components/RgoTableRowExpandable/RgoTableRowExpandable";
