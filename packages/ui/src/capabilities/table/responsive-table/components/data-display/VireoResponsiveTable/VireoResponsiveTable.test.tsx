import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { VireoResponsiveTable } from "./VireoResponsiveTable";
import { vireoResponsiveTableClasses } from "./VireoResponsiveTable.classes";
import { VIREO_RESPONSIVE_TABLE_NAME } from "./VireoResponsiveTable.identity";
import type { VireoResponsiveTableLabels, VireoResponsiveTableProps } from "./VireoResponsiveTable.types";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

const rows = [
  { id: 1, name: "Northstar", owner: "Maya" },
  { id: 2, name: "Atlas", owner: "Niko" },
];
const columns = [
  { id: "name", sort: "name", renderHeader: () => "Name", renderBody: (row: (typeof rows)[number]) => row.name },
  { id: "owner", renderHeader: () => "Owner", renderBody: (row: (typeof rows)[number]) => row.owner },
] as const;
const labels: VireoResponsiveTableLabels = {
  table: "Accounts",
  loadingTable: "Loading accounts",
  noData: "No accounts",
  showMore: "Show more",
  showLess: "Show less",
  rowsPerPage: "Rows per page",
  paginationMoreThan: (from, to) => `${from}-${to}+`,
  paginationRange: (from, to, count) => `${from}-${to}/${count}`,
  paginationItem: type => `${type} page`,
  filters: "Filters",
  clearFilters: "Clear",
  filtersDone: "Done",
  sortBy: "Sort by",
  sortDirection: "Sort direction",
  ascending: "Ascending",
  descending: "Descending",
  ascendingSortDirection: "Sort ascending",
  descendingSortDirection: "Sort descending",
};
const requiredProps = {
  layout: "desktop",
  columns,
  data: rows,
  filters: { page: 0, rowsPerPage: 10, sortBy: "name", sortDirection: "asc" },
  onFiltersChange: vi.fn(),
  labels,
  layers: { stickyToolbar: 4, stickyRowHeader: 3 },
} satisfies VireoResponsiveTableProps<(typeof rows)[number], typeof columns>;

describe(VIREO_RESPONSIVE_TABLE_NAME, () => {
  it("renders typed columns and rows in desktop layout", () => {
    render(<VireoResponsiveTable {...requiredProps} />);
    expect(screen.getByRole("table", { name: "Accounts" })).toBeInTheDocument();
    expect(screen.getByText("Northstar")).toBeInTheDocument();
    expect(screen.getByText("Maya")).toBeInTheDocument();
  });

  it("emits controlled sorting state", () => {
    const onFiltersChange = vi.fn();
    render(<VireoResponsiveTable {...requiredProps} onFiltersChange={onFiltersChange} />);
    fireEvent.click(screen.getByRole("button", { name: /Name/ }));
    expect(onFiltersChange).toHaveBeenCalledWith({ page: 0, rowsPerPage: 10, sortBy: "name", sortDirection: "desc" });
  });

  it("renders loading and empty states", () => {
    const { rerender } = render(<VireoResponsiveTable {...requiredProps} data={[]} skeleton />);
    expect(screen.getByRole("table", { name: "Accounts" })).toBeInTheDocument();
    rerender(<VireoResponsiveTable {...requiredProps} data={[]} />);
    expect(screen.getByText("No accounts")).toBeInTheDocument();
  });

  it("forwards refs and merges root slot customization with owner state", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const slotRef = React.createRef<HTMLDivElement>();
    render(
      <VireoResponsiveTable
        {...requiredProps}
        ref={forwardedRef}
        className="direct-class"
        slots={{ root: "section" }}
        slotProps={{
          root: ownerState => ({
            ref: slotRef,
            "aria-label": `${ownerState.layout} accounts`,
            className: "slot-class",
            "data-loading": ownerState.skeleton,
          }),
        }}
      />,
    );
    const root = screen.getByRole("region", { name: "desktop accounts" });
    expect(root).toBe(forwardedRef.current);
    expect(root).toBe(slotRef.current);
    expect(root).toHaveClass(vireoResponsiveTableClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-container-layout", "desktop");
  });

  it("uses theme default props and root style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_RESPONSIVE_TABLE_NAME]: {
          defaultProps: { className: "theme-default" },
          styleOverrides: { root: { color: "rgb(123, 45, 67)" } },
        },
      },
    });
    const { container } = render(
      <ThemeProvider theme={theme}>
        <VireoResponsiveTable {...requiredProps} />
      </ThemeProvider>,
    );
    const root = container.querySelector(`.${vireoResponsiveTableClasses.root}`);
    expect(root).toHaveClass("theme-default");
    expect(root).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });

  it("rejects duplicate column identities", () => {
    const duplicateColumns = [columns[0], columns[0]] as const;
    expect(() => render(<VireoResponsiveTable {...requiredProps} columns={duplicateColumns} />)).toThrow(/duplicated/);
  });
});
