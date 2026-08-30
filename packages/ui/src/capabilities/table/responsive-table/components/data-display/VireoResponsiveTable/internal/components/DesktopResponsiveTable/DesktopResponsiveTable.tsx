import { mergeSx, VireoSkeleton, VireoTruncatedContent } from "@/core/public";
import type {
  VireoResponsiveTableColumn,
  VireoResponsiveTableProps,
} from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/VireoResponsiveTable.types";
import type { VireoResponsiveTableState } from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/hooks/useVireoResponsiveTableState/useVireoResponsiveTableState";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";

export function DesktopResponsiveTable<
  TItem,
  const TColumns extends readonly VireoResponsiveTableColumn<NoInfer<TItem>, string>[],
>({
  tableProps,
  state,
  skeletonVisible,
}: {
  tableProps: VireoResponsiveTableProps<TItem, TColumns>;
  state: VireoResponsiveTableState<TItem>;
  skeletonVisible: boolean;
}) {
  const {
    data,
    filters,
    getRowKey,
    getRowSx,
    labels,
    onFiltersChange,
    renderFilters,
    renderEmptyState,
    size = "small",
    skeleton = false,
    totalCount,
  } = tableProps;
  const {
    desktopColumnWidths,
    desktopPageRows,
    getStickyCellSx,
    handleSort,
    orderedColumns,
    resolvedActionsColumn,
    rowsPerPageOptions,
    skeletonPlaceholderCount,
  } = state;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, minWidth: 0 }}>
      {renderFilters?.()}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          marginTop: renderFilters ? "calc(3 * var(--mui-spacing))" : 0,
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <TableContainer sx={{ flex: 1, minHeight: 0, overflow: "auto", backgroundColor: "surface.raised" }}>
          <Table
            stickyHeader
            size={size}
            aria-label={labels.table}
            sx={{
              tableLayout: "fixed",
              width: `max(100%, ${desktopColumnWidths.tableWidth}px)`,
              minWidth: `${desktopColumnWidths.tableWidth}px`,
            }}
          >
            <colgroup>
              {orderedColumns.map(column => (
                <col key={column.id} style={{ width: desktopColumnWidths.byId.get(column.id) }} />
              ))}
            </colgroup>
            <TableHead>
              <TableRow>
                {orderedColumns.map(column => {
                  const isSortable = Boolean(column.sort?.trim());
                  const isActiveSort = isSortable && filters.sortBy === column.sort;
                  return (
                    <TableCell
                      align={column.align}
                      key={column.id}
                      sortDirection={isActiveSort ? filters.sortDirection : false}
                      sx={{ ...getStickyCellSx(column, true), height: 52, fontWeight: 750, whiteSpace: "nowrap" }}
                    >
                      {isSortable ? (
                        <TableSortLabel
                          active={isActiveSort}
                          disabled={skeleton}
                          direction={isActiveSort ? filters.sortDirection : "asc"}
                          onClick={skeleton ? undefined : () => handleSort(column.sort!)}
                          sx={{
                            flexDirection: column.align === "right" ? "row-reverse" : "row",
                            "& .MuiTableSortLabel-icon": {
                              ...(column.align === "right" && { ml: 0, mr: 0.5 }),
                              opacity: isActiveSort ? 1 : 0,
                            },
                            "&:hover .MuiTableSortLabel-icon": { opacity: isActiveSort ? 1 : 0.5 },
                          }}
                        >
                          {column.renderHeader()}
                        </TableSortLabel>
                      ) : (
                        column.renderHeader()
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {skeleton ? (
                Array.from({ length: skeletonPlaceholderCount }).map((_, rowIndex) => (
                  <TableRow
                    key={`skeleton-row-${rowIndex}`}
                    aria-hidden="true"
                    sx={{ visibility: skeletonVisible ? "visible" : "hidden" }}
                  >
                    {orderedColumns.map((column, columnIndex) => {
                      const isActionsColumn = column.id === resolvedActionsColumn?.id;
                      const skeletonWidth = isActionsColumn ? 62 : `${58 + ((rowIndex * 17 + columnIndex * 11) % 34)}%`;
                      return (
                        <TableCell align={column.align} key={column.id} sx={{ ...getStickyCellSx(column, false) }}>
                          <VireoSkeleton
                            variant="rounded"
                            sx={{
                              height: isActionsColumn ? 30 : size === "small" ? 20 : 24,
                              width: skeletonWidth,
                              ml: column.align === "right" || column.align === "center" ? "auto" : 0,
                              mr: column.align === "center" ? "auto" : 0,
                            }}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : desktopPageRows.length === 0 ? (
                <TableRow sx={{ height: size === "small" ? 52 : 72 }}>
                  <TableCell
                    colSpan={orderedColumns.length}
                    align="center"
                    sx={{ height: size === "small" ? 52 : 72, color: "text.secondary", borderBottom: 0 }}
                  >
                    {renderEmptyState?.() ?? labels.noData}
                  </TableCell>
                </TableRow>
              ) : (
                desktopPageRows.map((item, rowIndex) => (
                  <TableRow
                    hover
                    key={getRowKey?.(item, rowIndex) ?? rowIndex}
                    sx={mergeSx({ "&:last-child td": { borderBottom: 0 } }, getRowSx?.(item, rowIndex, "desktop"))}
                  >
                    {orderedColumns.map(column => {
                      const body = column.renderBody(item, rowIndex, { placement: "desktop" });
                      return (
                        <TableCell align={column.align} key={column.id} sx={{ ...getStickyCellSx(column, false) }}>
                          {column.id === resolvedActionsColumn?.id ? (
                            body
                          ) : (
                            <VireoTruncatedContent
                              collapsedHeight={48}
                              collapseLabel={labels.showLess}
                              expandLabel={labels.showMore}
                              stopPropagation
                              slotProps={{ content: { sx: { overflowWrap: "anywhere" } } }}
                            >
                              {body}
                            </VireoTruncatedContent>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount ?? data.length}
          slotProps={{
            actions: {
              previousButton: { disabled: skeleton || filters.page <= 0 },
              nextButton: {
                disabled: skeleton || filters.page >= Math.ceil((totalCount ?? data.length) / filters.rowsPerPage) - 1,
              },
            },
            select: { disabled: skeleton },
          }}
          page={filters.page}
          labelRowsPerPage={labels.rowsPerPage}
          labelDisplayedRows={({ from, to, count }) =>
            count === -1 ? labels.paginationMoreThan(from, to) : labels.paginationRange(from, to, count)
          }
          getItemAriaLabel={labels.paginationItem}
          rowsPerPage={filters.rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          onPageChange={(_, page) => onFiltersChange({ ...filters, page })}
          onRowsPerPageChange={event =>
            onFiltersChange({ ...filters, page: 0, rowsPerPage: Number.parseInt(event.target.value, 10) })
          }
          sx={{
            flexShrink: 0,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "surface.base",
            color: "text.primary",
            pointerEvents: skeleton ? "none" : "auto",
          }}
        />
      </Box>
    </Box>
  );
}
