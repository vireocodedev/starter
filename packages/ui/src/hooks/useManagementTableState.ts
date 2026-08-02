import { DEFAULT_PAGINATION_OPTIONS } from "@/components/data-display/RgoTable";
import { type PageableParams } from "@/utils/apiutils";
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
