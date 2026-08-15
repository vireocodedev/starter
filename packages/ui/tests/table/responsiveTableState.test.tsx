import { type ResponsiveTableColumn, useResponsiveTableState } from "@/table/responsiveTableState";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

type Row = { id: number; name: string };

const columns = [
  {
    id: "actions",
    sticky: "right",
    width: 80,
    renderHeader: () => "Actions",
    renderBody: () => "Action",
  },
  {
    id: "name",
    sort: "name",
    renderHeader: () => "Name",
    renderBody: (row: Row) => row.name,
  },
  {
    id: "id",
    sticky: "left",
    width: 100,
    renderHeader: () => "ID",
    renderBody: (row: Row) => row.id,
  },
] as const satisfies readonly ResponsiveTableColumn<Row>[];

const data: Row[] = Array.from({ length: 6 }, (_, index) => ({ id: index + 1, name: `Row ${index + 1}` }));

describe("useResponsiveTableState", () => {
  it("derives stable sticky ordering and client-side desktop pagination", () => {
    const { result } = renderHook(() =>
      useResponsiveTableState({
        actionsColumn: "actions",
        columns,
        data,
        filters: { page: 1, rowsPerPage: 2, sortBy: "name", sortDirection: "asc" },
        onFiltersChange: vi.fn(),
      }),
    );

    expect(result.current.orderedColumns.map(column => column.id)).toEqual(["id", "name", "actions"]);
    expect(result.current.desktopPageRows.map(row => row.id)).toEqual([3, 4]);
    expect(result.current.mobileDetailColumns.map(column => column.id)).toEqual(["id", "name"]);
  });

  it("resets pagination and toggles direction when the active column is sorted", () => {
    const onFiltersChange = vi.fn();
    const { result } = renderHook(() =>
      useResponsiveTableState({
        columns,
        data,
        filters: { page: 2, rowsPerPage: 2, sortBy: "name", sortDirection: "asc" },
        onFiltersChange,
      }),
    );

    act(() => result.current.handleSort("name"));

    expect(onFiltersChange).toHaveBeenCalledWith({
      page: 0,
      rowsPerPage: 2,
      sortBy: "name",
      sortDirection: "desc",
    });
  });

  it("rejects duplicate column identifiers", () => {
    const duplicateColumns = [columns[1], { ...columns[1] }] as const;
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      expect(() =>
        renderHook(() =>
          useResponsiveTableState({
            columns: duplicateColumns,
            data,
            filters: { page: 0, rowsPerPage: 10, sortBy: "name", sortDirection: "asc" },
            onFiltersChange: vi.fn(),
          }),
        ),
      ).toThrow('ResponsiveTable column id "name" is duplicated.');
    } finally {
      consoleError.mockRestore();
    }
  });
});
