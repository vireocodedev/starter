import { RgoServerTable } from "@/components/data-display/RgoServerTable/RgoServerTable";
import { ResponsiveCard } from "@/components/ResponsiveCard";
import { useAppPageContentLayout } from "@/hooks/useAppPageContentLayout";
import { RgoServerTableMobile } from "@/table/components/RgoServerTableMobile";
import { type PageableParams, type PageableResponse } from "@/utils/apiutils";
import { type ReactStateSetter } from "@/utils/typeutils";
import { CardHeader } from "@mui/material";
import React from "react";

type RgoServerTableProps<TElement> = React.ComponentProps<typeof RgoServerTable<TElement>>;

const DEFAULT_ROWS_PER_PAGE_OPTIONS = [10, 20, 50];

export type ManagementServerTableProps<TElement> = {
  data: PageableResponse<TElement>;
  pagination: PageableParams;
  onPaginationChange: ReactStateSetter<PageableParams>;
  columns: RgoServerTableProps<TElement>["columns"];
  keyMapper: RgoServerTableProps<TElement>["keyMapper"];
  renderFilters: () => React.ReactNode;
  renderMobileFilters?: () => React.ReactNode;
  renderMobileSearch?: () => React.ReactNode;
  filtersCount?: number;
  onClearFilters?: () => void;
  onMobileFiltersDone?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadNextPage?: () => void;
  columnIdToUseAsTitle?: string;
  columnIdToUseAsActions?: string;
  titleEndAdornmentFn?: (element: TElement) => React.ReactNode;
  rowsPerPageOptions?: RgoServerTableProps<TElement>["rowsPerPageOptions"];
};

export function ManagementServerTable<TElement>({
  data,
  pagination,
  onPaginationChange,
  columns,
  keyMapper,
  renderFilters,
  renderMobileFilters,
  renderMobileSearch,
  filtersCount,
  onClearFilters,
  onMobileFiltersDone,
  hasNextPage,
  isFetchingNextPage,
  onLoadNextPage,
  columnIdToUseAsTitle,
  columnIdToUseAsActions,
  titleEndAdornmentFn,
  rowsPerPageOptions = DEFAULT_ROWS_PER_PAGE_OPTIONS,
}: ManagementServerTableProps<TElement>) {
  const { isCompact } = useAppPageContentLayout();
  const filtersNode = isCompact ? renderMobileFilters?.() : renderFilters();
  const mobileSearchNode = isCompact ? renderMobileSearch?.() : undefined;

  return (
    <ResponsiveCard sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      {!isCompact && (
        <CardHeader
          sx={{
            p: 2,
            flexShrink: 0,
            backgroundColor: "var(--mui-palette-grey-50)",
          }}
          title={filtersNode}
        />
      )}

      {!isCompact && (
        <RgoServerTable
          data={data.content}
          count={data.totalElements}
          keyMapper={keyMapper}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          columns={columns}
          rowsPerPageOptions={rowsPerPageOptions}
          fillHeight
        />
      )}

      {isCompact && (
        <RgoServerTableMobile
          data={data.content}
          count={data.totalElements}
          keyMapper={keyMapper}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          columns={columns}
          columnIdToUseAsActions={columnIdToUseAsActions}
          columnIdToUseAsTitle={columnIdToUseAsTitle}
          filtersNode={filtersNode}
          searchNode={mobileSearchNode}
          rowsPerPageOptions={rowsPerPageOptions}
          filtersCount={filtersCount}
          onClearFilters={onClearFilters}
          onFiltersDone={onMobileFiltersDone}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadNextPage={onLoadNextPage}
          titleEndAdornmentFn={titleEndAdornmentFn}
        />
      )}
    </ResponsiveCard>
  );
}
