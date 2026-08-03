import {
  calculateStickySx,
  type DtBaseColumn,
  type DtBaseProps,
  type PaginationProps,
} from "@/components/data-display/RgoTable";
import { RgoTableCellSortable } from "@/components/data-display/RgoTable/components/RgoTableCellSortable/RgoTableCellSortable";
import { RgoTablePagination } from "@/components/data-display/RgoTable/components/RgoTablePagination/RgoTablePagination";
import { RgoTableRowExpandable } from "@/components/data-display/RgoTable/components/RgoTableRowExpandable/RgoTableRowExpandable";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React from "react";
import "./RgoServerTable.css";

export type RgoServerTableColumn<T> = DtBaseColumn<T, string>;

export type RgoServerTableProps<T> = DtBaseProps<T> & {
  columns: RgoServerTableColumn<T>[];
  count: number;
  /**
   * Fill the available height of a flex-column parent instead of growing with the row count.
   * The body scrolls internally and the header sticks, with no height measurement and no
   * `calc(100dvh - Npx)` guess — so the table is at its final height on the very first paint.
   * Takes precedence over {@link DtBaseProps.stickyMaxHeight}.
   */
  fillHeight?: boolean;
} & PaginationProps;

export function RgoServerTable<T>({
  data,
  columns: columnsProp,
  keyMapper,
  pagination,
  onPaginationChange,
  count,
  rowsPerPageOptions,
  AccordionComponent,
  isRowExpandable,
  size = "medium",
  className,
  highlighted,
  stickyMaxHeight,
  fillHeight = false,
  paperClassName,
  noDataMessage = "No data available",
  disableHeader = false,
}: RgoServerTableProps<T>) {
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const sortBy = pagination.sortBy;
  const sortDirection = pagination.sortDirection || "asc";
  const useStickyHeader =
    fillHeight || typeof stickyMaxHeight === "number" || typeof stickyMaxHeight === "string";

  const handlePaginationChange: PaginationProps["onPaginationChange"] = React.useCallback(
    value => {
      onPaginationChange(value);
      tableContainerRef.current?.scrollTo({ top: 0 });
    },
    [onPaginationChange],
  );

  const columns = React.useMemo(() => {
    return [...columnsProp].sort((a, b) => {
      // first those with sticky === "left"
      // second those with sticky === false or undefined
      // third those with sticky === "right"
      if (a.sticky === "left" && b.sticky !== "left") return -1;
      if (a.sticky !== "left" && b.sticky === "left") return 1;
      if ((a.sticky === false || a.sticky === undefined) && b.sticky === "right") return -1;
      if (a.sticky === "right" && (b.sticky === false || b.sticky === undefined)) return 1;
      return 0;
    });
  }, [columnsProp]);

  const onSortColumnClick = React.useCallback(
    (id: string) => {
      handlePaginationChange(prev => {
        let newSortBy = id;
        let newSortDirection: "asc" | "desc" = "desc";

        if (prev.sortBy !== id) {
          newSortDirection = "asc";
        } else if (prev.sortDirection === "desc") {
          newSortBy = "";
          newSortDirection = "asc";
        }

        return { ...prev, sortBy: newSortBy, sortDirection: newSortDirection };
      });
    },
    [handlePaginationChange],
  );

  const isAccordionComponentDefined = !!AccordionComponent;

  const headerCells = React.useMemo(
    () =>
      columns.map(({ id, HeaderComponent, align, sort, widthPctShare, widthPxMin }, i) => {
        const active = id === sortBy;
        const direction = sortDirection;
        const colSpan = i === 0 && isAccordionComponentDefined ? 2 : undefined;

        return (
          <React.Fragment key={id}>
            {sort ? (
              <RgoTableCellSortable
                id={id}
                align={align}
                HeaderComponent={HeaderComponent}
                active={active}
                direction={direction}
                priority={undefined}
                onClick={onSortColumnClick}
                widthPctShare={widthPctShare}
                colSpan={colSpan}
                widthPxMin={widthPxMin}
                sx={calculateStickySx(
                  columns,
                  i,
                  isAccordionComponentDefined && i > 0 ? (size === "medium" ? 52 : 46) : 0,
                  true,
                )}
              />
            ) : (
              <TableCell
                align={align}
                data-column={id}
                sx={{
                  width: `${widthPctShare}%`,
                  minWidth: `${widthPxMin}px`,
                  ...calculateStickySx(
                    columns,
                    i,
                    isAccordionComponentDefined && i > 0 ? (size === "medium" ? 52 : 46) : 0,
                    true,
                  ),
                }}
                colSpan={colSpan}
              >
                <HeaderComponent />
              </TableCell>
            )}
          </React.Fragment>
        );
      }),
    [columns, sortBy, sortDirection, onSortColumnClick, isAccordionComponentDefined, size],
  );

  return (
    <Paper
      className={paperClassName}
      sx={{
        width: "100%",
        overflow: useStickyHeader ? "hidden" : undefined,
        outline: "1px solid var(--mui-palette-grey-300)",
        borderTopLeftRadius: "unset !important",
        borderTopRightRadius: "unset !important",
        ...(fillHeight && {
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          "& > .MuiTablePagination-root": { flexShrink: 0 },
        }),
      }}
    >
      <TableContainer
        ref={tableContainerRef}
        sx={fillHeight ? { flex: 1, minHeight: 0 } : { maxHeight: useStickyHeader ? stickyMaxHeight : undefined }}
      >
        <Table stickyHeader={useStickyHeader} className={`${className} rgo-table`} size={size}>
          {!disableHeader && (
            <TableHead>
              <TableRow>{headerCells}</TableRow>
            </TableHead>
          )}

          <TableBody>
            {data.map(item => {
              const isExpandable = isRowExpandable ? isRowExpandable(item) : true;

              return (
                <React.Fragment key={keyMapper(item)}>
                  {AccordionComponent ? (
                    <RgoTableRowExpandable
                      highlighted={highlighted}
                      item={item}
                      columns={columns}
                      AccordionComponent={AccordionComponent}
                      disabled={!isExpandable}
                      tableSize={size}
                    />
                  ) : (
                    <TableRow className={highlighted?.(item) ? "highlighted" : ""} hover role="checkbox" tabIndex={-1}>
                      {columns.map(({ id, align, BodyComponent }, index) => (
                        <TableCell key={id} align={align} sx={calculateStickySx(columns, index, null, false, true)}>
                          <BodyComponent element={item} index={-1} />
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + (AccordionComponent ? 1 : 0)} align="center">
                  {noDataMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <RgoTablePagination
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        count={count}
        rowsPerPageOptions={rowsPerPageOptions}
      />
    </Paper>
  );
}
