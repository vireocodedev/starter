import { DEFAULT_PAGINATION_OPTIONS, type PageableParams } from "@rgo/front-ui";
import React from "react";

export type UseManagementTableStateProps<TFilters> = {
  initialFilters: TFilters;
  initialPagination: Partial<PageableParams>;
};

export function useManagementTableState<TFilters>({
  initialFilters,
  initialPagination,
}: UseManagementTableStateProps<TFilters>) {
  const [pagination, setPagination] = React.useState<PageableParams>(() => ({
    ...DEFAULT_PAGINATION_OPTIONS,
    ...initialPagination,
  }));
  const [filters, setFilters] = React.useState<TFilters>(initialFilters);

  return {
    filters,
    setFilters,
    pagination,
    setPagination,
  };
}
