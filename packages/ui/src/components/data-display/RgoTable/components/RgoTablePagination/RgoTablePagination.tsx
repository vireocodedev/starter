import { type DtRowsPerPageOptions } from "@/components/data-display/RgoTable";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { type PageableParams } from "@/utils/apiutils";
import { type ReactStateSetter } from "@/utils/typeutils";
import { type LabelDisplayedRowsArgs, TablePagination } from "@mui/material";
import React from "react";
import "./RgoTablePagination.css";

const DEFAULT_ROWS_PER_PAGE_OPTS = [10, 20, 50] as const;

export type RgoTablePaginationProps = {
  pagination: PageableParams;
  onPaginationChange: ReactStateSetter<PageableParams>;
  count: number;
  rowsPerPageOptions?: DtRowsPerPageOptions;
};

export function RgoTablePagination({
  pagination,
  onPaginationChange,
  count,
  rowsPerPageOptions = DEFAULT_ROWS_PER_PAGE_OPTS,
}: RgoTablePaginationProps) {
  const t = useTranslationLocal();

  const labelRowsPerPage = t("common.rowsPerPage");
  const nextButtonTitle = t("common.goToNextPage");
  const previousButtonTitle = t("common.goToPreviousPage");

  const page = pagination?.page ?? 0;
  const rowsPerPage = pagination?.rowsPerPage ?? 0;
  const rowsPerPageOptionsStringified = JSON.stringify(rowsPerPageOptions);

  const rowsPerPageOptionsMemoized = React.useMemo(() => {
    return JSON.parse(rowsPerPageOptionsStringified) as DtRowsPerPageOptions;
  }, [rowsPerPageOptionsStringified]);

  const labelDisplayedRows = React.useCallback(
    ({ from, to, count }: LabelDisplayedRowsArgs) =>
      t("common.displayedRows", { from: String(from), to: String(to), count }),
    [t],
  );

  const onPageChange = React.useCallback(
    (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      onPaginationChange(prev => ({ ...prev, page: newPage }));
    },
    [onPaginationChange],
  );

  const onRowsPerPageChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newRowsPerPage = +event.target.value;
      onPaginationChange(prev => ({
        ...prev,
        page: 0,
        rowsPerPage: newRowsPerPage,
      }));
    },
    [onPaginationChange],
  );

  return (
    <TablePagination
      component="div"
      page={page}
      labelRowsPerPage={labelRowsPerPage}
      labelDisplayedRows={labelDisplayedRows}
      rowsPerPageOptions={rowsPerPageOptionsMemoized}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      count={count}
      slotProps={{
        actions: {
          nextButton: {
            title: nextButtonTitle,
          },
          previousButton: {
            title: previousButtonTitle,
          },
        },
      }}
    />
  );
}
