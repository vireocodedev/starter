import { DEFAULT_PAGINATION_OPTIONS } from "@/components/data-display/RgoTable";
import {
  RgoTablePagination,
  type RgoTablePaginationProps,
} from "@/components/data-display/RgoTable/components/RgoTablePagination/RgoTablePagination";
import { type PageableParams } from "@/utils/apiutils";
import React from "react";

type RgoTablePaginationWithDefaultsDemoProps = Partial<
  Omit<RgoTablePaginationProps, "pagination" | "onPaginationChange">
>;

export function RgoTablePaginationWithDefaultsDemo({
  count = 100,
  rowsPerPageOptions = [10, 20, 50],
}: RgoTablePaginationWithDefaultsDemoProps) {
  const [pagination, setPagination] = React.useState<PageableParams>(DEFAULT_PAGINATION_OPTIONS);

  return (
    <RgoTablePagination
      count={count}
      rowsPerPageOptions={rowsPerPageOptions}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
}

export const RgoTablePaginationWithDefaultsDemoCode = `
import { 
  DEFAULT_PAGINATION_OPTIONS
  RgoTablePagination
  type RgoTablePaginationProps
  type PageableParams
} from "@vireocodedev/starter-ui";
import React from "react";

type RgoTablePaginationWithDefaultsDemoProps = Partial<
  Omit<RgoTablePaginationProps, "pagination" | "onPaginationChange">
>;

export function RgoTablePaginationWithDefaultsDemo({
  count = 100,
  rowsPerPageOptions = [10, 20, 50],
}: RgoTablePaginationWithDefaultsDemoProps) {
  const [pagination, setPagination] = React.useState<PageableParams>(DEFAULT_PAGINATION_OPTIONS);

  return (
    <RgoTablePagination
      count={count}
      rowsPerPageOptions={rowsPerPageOptions}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
}`;
