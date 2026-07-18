import { MobileTableRows } from "@/table/components/MobileTableAccordionRow";
import { MobileTableFiltersDrawer } from "@/table/components/MobileTableFiltersDrawer";
import { MobileTableToolbar } from "@/table/components/MobileTableToolbar";
import { useMobileTableExpansion } from "@/table/hooks/useMobileTableExpansion";
import { type RgoServerTableMobileProps, type SortDirection } from "@/table/types";
import {
  getActionColumn,
  getColumnId,
  getColumnSort,
  getDetailColumns,
  getSortableColumns,
  getSortDirection,
  getTitleColumn,
  validateFiltersCount,
} from "@/table/utils/mobileTable.utils";
import { Stack } from "@mui/material";
import { usePlatformTranslation } from "@vireocodedev/starter-localization";
import React from "react";

export function RgoServerTableMobile<TElement>({
  data,
  keyMapper,
  pagination,
  onPaginationChange,
  columns,
  filtersNode,
  searchNode,
  filtersCount,
  onClearFilters,
  onFiltersDone,
  hasNextPage,
  isFetchingNextPage,
  onLoadNextPage,
  defaultExpanded = false,
  columnIdToUseAsTitle,
  columnIdToUseAsActions,
  actionsColumnAlign = "right",
  titleEndAdornmentFn,
}: RgoServerTableMobileProps<TElement>) {
  const { t } = usePlatformTranslation();
  const [filtersDrawerOpen, setFiltersDrawerOpen] = React.useState(false);
  const normalizedFiltersCount = validateFiltersCount(filtersCount);
  const { expandedByKey, handleExpandedChange, setAccordionRef } = useMobileTableExpansion({
    data,
    defaultExpanded,
    keyMapper,
  });
  const titleColumn = React.useMemo(
    () => getTitleColumn(columns, columnIdToUseAsTitle),
    [columns, columnIdToUseAsTitle],
  );
  const actionColumn = React.useMemo(
    () => getActionColumn(columns, columnIdToUseAsActions),
    [columns, columnIdToUseAsActions],
  );
  const detailColumns = React.useMemo(
    () => getDetailColumns(columns, titleColumn, actionColumn),
    [columns, titleColumn, actionColumn],
  );
  const sortableColumns = React.useMemo(() => getSortableColumns(columns), [columns]);
  const activeSortDirection = getSortDirection(pagination.sortDirection);
  const activeSortColumn = React.useMemo(
    () =>
      sortableColumns.find(column => getColumnSort(column) === pagination.sortBy) ??
      sortableColumns.find(column => getColumnId(column) === pagination.sortBy) ??
      sortableColumns[0],
    [pagination.sortBy, sortableColumns],
  );
  const activeSortValue = activeSortColumn ? (getColumnSort(activeSortColumn) ?? "") : "";

  const handleSortColumnChange = (sortBy: string | null) => {
    if (!sortBy) return;

    onPaginationChange({
      ...pagination,
      page: 0,
      sortBy,
    });
  };

  const handleSortDirectionChange = (_event: React.MouseEvent<HTMLElement>, sortDirection: SortDirection | null) => {
    if (!sortDirection) {
      return;
    }

    onPaginationChange({
      ...pagination,
      page: 0,
      sortBy: activeSortValue || pagination.sortBy,
      sortDirection,
    });
  };

  return (
    <Stack
      width="100%"
      spacing={1.25}
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <MobileTableToolbar
        filtersCount={normalizedFiltersCount}
        onFiltersOpen={() => setFiltersDrawerOpen(true)}
        openFiltersLabel={t("common.openFilters")}
        searchNode={searchNode}
      />

      <MobileTableFiltersDrawer
        activeSortDirection={activeSortDirection}
        activeSortValue={activeSortValue}
        filtersCount={normalizedFiltersCount}
        filtersNode={filtersNode}
        onClearFilters={onClearFilters}
        onClose={() => setFiltersDrawerOpen(false)}
        onDone={onFiltersDone}
        onOpen={() => setFiltersDrawerOpen(true)}
        onSortColumnChange={handleSortColumnChange}
        onSortDirectionChange={handleSortDirectionChange}
        open={filtersDrawerOpen}
        sortableColumns={sortableColumns}
      />

      <MobileTableRows
        actionColumn={actionColumn}
        actionsColumnAlign={actionsColumnAlign}
        data={data}
        defaultExpanded={defaultExpanded}
        detailColumns={detailColumns}
        expandedByKey={expandedByKey}
        handleExpandedChange={handleExpandedChange}
        keyMapper={keyMapper}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadNextPage={onLoadNextPage}
        setAccordionRef={setAccordionRef}
        titleColumn={titleColumn}
        titleEndAdornmentFn={titleEndAdornmentFn}
      />
    </Stack>
  );
}
