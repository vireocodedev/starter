import {
  calculateStickySx,
  RgoTablePagination,
  type DtBaseColumn,
  type DtBaseProps,
  type DtBaseSortItem,
  type PaginationProps,
} from "@/components/data-display/RgoTable";
import { RgoTableCellSortable } from "@/components/data-display/RgoTable/components/RgoTableCellSortable/RgoTableCellSortable";
import { RgoTableRowExpandable } from "@/components/data-display/RgoTable/components/RgoTableRowExpandable/RgoTableRowExpandable";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, type SxProps } from "@mui/material";
import React, { Fragment, useMemo, useState } from "react";
import "./RgoClientTable.css";

export type RgoClientTableColumn<T> = DtBaseColumn<T, (o1: T, o2: T) => number>;

export type RgoClientTableProps<T> = DtBaseProps<T> & {
  columns: RgoClientTableColumn<T>[];
} & (
    | ({
        disablePagination?: false;
      } & PaginationProps)
    | {
        disablePagination: true;
      }
  );

const EMPTY_PAGINATION = {} as PaginationProps["pagination"];
const NOOP = () => {};

export function RgoClientTable<T>(props: RgoClientTableProps<T>) {
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const {
    highlighted,
    data,
    columns: columnsProp,
    disablePagination,
    AccordionComponent,
    isRowExpandable,
    size = "medium",
    className = "",
    stickyMaxHeight = undefined,
    paperClassName,
    noDataMessage = "No data available",
    keyMapper,
    disableHeader = false,
  } = props;
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

  const [sortData, setSortData] = useState<DtBaseSortItem[]>([]);
  const useStickyHeader = typeof stickyMaxHeight === "number" || typeof stickyMaxHeight === "string";

  const pagination: PaginationProps["pagination"] = props.disablePagination ? EMPTY_PAGINATION : props.pagination;

  const onPaginationChange: PaginationProps["onPaginationChange"] = disablePagination ? NOOP : props.onPaginationChange;

  const handlePaginationChange: PaginationProps["onPaginationChange"] = React.useCallback(
    value => {
      onPaginationChange(value);
      tableContainerRef.current?.scrollTo({ top: 0 });
    },
    [onPaginationChange],
  );
  const rowsPerPageOptions: PaginationProps["rowsPerPageOptions"] = disablePagination ? [] : props.rowsPerPageOptions;

  const filteredData = useMemo(() => {
    if (disablePagination) return data;
    const { page, rowsPerPage } = pagination;
    let localData = data;
    if (sortData.length > 0) {
      localData = [...data].sort((a, b) => {
        for (const sortProps of sortData) {
          const { id, direction } = sortProps;
          const column = columns.find(v => v.id === id);
          if (!column || !column.sort) continue;
          const sortValue = column.sort(a, b);
          if (sortValue !== 0) return direction === "asc" ? sortValue : -sortValue;
        }
        return 0;
      });
    }
    return localData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [data, pagination, disablePagination, sortData, columns]);

  const onSortColumnClick = (id: string) => {
    const sortIndex = sortData.findIndex(v => v.id === id);
    if (sortIndex < 0) {
      setSortData([{ id, direction: "asc" }]);
      return;
    }
    const sortProps = sortData[sortIndex];
    const oldDirection = sortProps.direction;
    if (oldDirection === "desc") {
      setSortData([]);
      return;
    }
    setSortData([{ id, direction: "desc" }]);
  };

  const paginationComponent = disablePagination ? (
    <></>
  ) : (
    <RgoTablePagination
      pagination={pagination}
      onPaginationChange={handlePaginationChange}
      count={data.length}
      rowsPerPageOptions={rowsPerPageOptions}
    />
  );

  const tableContainerSx = React.useMemo(() => {
    return {
      maxHeight: useStickyHeader ? stickyMaxHeight : undefined,
    } satisfies SxProps;
  }, [stickyMaxHeight, useStickyHeader]);

  return (
    <Paper className={`${paperClassName ?? ""} rgo-table-paper`} data-sticky={useStickyHeader}>
      <TableContainer ref={tableContainerRef} sx={tableContainerSx}>
        <Table stickyHeader={useStickyHeader} className={`${className ?? ""} rgo-table`} size={size}>
          {!disableHeader && (
            <TableHead>
              <TableRow>
                {columns.map(({ id, HeaderComponent, align, sort, widthPctShare, widthPxMin }, index) => {
                  const sortIndex = sortData.findIndex(v => v.id === id);
                  const sortCount = sortData.length;
                  const sortProps = sortData[sortIndex];
                  const active = !!sortProps;
                  const direction = sortProps?.direction ?? "asc";
                  const priority = sortIndex + 1;
                  const colSpan = index === 0 && AccordionComponent ? 2 : undefined;

                  return (
                    <Fragment key={id}>
                      {sort ? (
                        <RgoTableCellSortable
                          id={id}
                          align={align}
                          HeaderComponent={HeaderComponent}
                          active={active}
                          direction={direction}
                          priority={sortCount < 2 ? undefined : priority}
                          onClick={onSortColumnClick}
                          widthPctShare={widthPctShare}
                          widthPxMin={widthPxMin}
                          colSpan={colSpan}
                          sx={calculateStickySx(
                            columns,
                            index,
                            !!AccordionComponent && index > 0 ? (size === "medium" ? 52 : 46) : 0,
                            true,
                          )}
                        />
                      ) : (
                        <TableCell
                          colSpan={colSpan}
                          sx={{
                            width: `${widthPctShare}%`,
                            minWidth: `${widthPxMin}px`,
                            ...calculateStickySx(
                              columns,
                              index,
                              !!AccordionComponent && index > 0 ? (size === "medium" ? 52 : 46) : 0,
                              true,
                            ),
                          }}
                          align={align}
                          data-column={id}
                        >
                          <HeaderComponent />
                        </TableCell>
                      )}
                    </Fragment>
                  );
                })}
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {filteredData.map(item => {
              const isExpandable = isRowExpandable ? isRowExpandable(item) : true;
              const rowKey = keyMapper(item);
              const rowIndex = data.findIndex(d => keyMapper(d) === rowKey);

              return (
                <React.Fragment key={rowKey}>
                  {AccordionComponent ? (
                    <RgoTableRowExpandable
                      highlighted={highlighted}
                      item={item}
                      columns={columns}
                      AccordionComponent={AccordionComponent}
                      disabled={!isExpandable}
                      rowIndex={rowIndex}
                      tableSize={size}
                    />
                  ) : (
                    <TableRow className={highlighted?.(item) ? "highlighted" : ""} hover role="checkbox" tabIndex={-1}>
                      {columns.map(({ id, align, BodyComponent }, index) => (
                        <TableCell key={id} align={align} sx={calculateStickySx(columns, index, null, false, true)}>
                          <BodyComponent element={item} index={rowIndex} />
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + (AccordionComponent ? 1 : 0)} align="center">
                  {noDataMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {paginationComponent}
    </Paper>
  );
}
