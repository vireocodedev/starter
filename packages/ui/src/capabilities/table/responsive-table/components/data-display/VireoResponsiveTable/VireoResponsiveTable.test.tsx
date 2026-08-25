import { IconButton, Stack, ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("keeps every Stack-wrapped row action visible in the mobile action grid", async () => {
    const mobileColumns = [
      ...columns,
      {
        id: "actions",
        renderHeader: () => "Actions",
        renderBody: (row: (typeof rows)[number]) => (
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <IconButton aria-label={`Edit ${row.name}`}>E</IconButton>
            <IconButton aria-label={`Delete ${row.name}`}>D</IconButton>
          </Stack>
        ),
      },
    ] as const;

    render(
      <VireoResponsiveTable
        {...requiredProps}
        layout="mobile"
        columns={mobileColumns}
        titleColumn="name"
        actionsColumn="actions"
        getRowKey={row => row.id}
      />,
    );

    const summary = await screen.findByRole("button", { name: "Northstar" });
    fireEvent.click(summary);
    const edit = await screen.findByRole("button", { name: "Edit Northstar" });
    expect(screen.getByRole("button", { name: "Delete Northstar" })).toBeVisible();
    expect(getComputedStyle(edit.parentElement!).display).toBe("grid");
  });

  it("keeps multiple mobile rows expanded with the default accordion transition", () => {
    render(<VireoResponsiveTable {...requiredProps} layout="mobile" titleColumn="name" getRowKey={row => row.id} />);

    const northstarSummary = screen.getByRole("button", { name: "Northstar" });
    const atlasSummary = screen.getByRole("button", { name: "Atlas" });
    fireEvent.click(northstarSummary);
    fireEvent.click(atlasSummary);

    expect(northstarSummary).toHaveAttribute("aria-expanded", "true");
    expect(atlasSummary).toHaveAttribute("aria-expanded", "true");
  });

  it("expands a mobile row without rerendering every loaded row", () => {
    const renderName = vi.fn((row: (typeof rows)[number]) => row.name);
    const performanceColumns = [
      { id: "name", renderHeader: () => "Name", renderBody: renderName },
      { id: "owner", renderHeader: () => "Owner", renderBody: (row: (typeof rows)[number]) => row.owner },
    ] as const;

    render(
      <VireoResponsiveTable
        {...requiredProps}
        layout="mobile"
        columns={performanceColumns}
        titleColumn="name"
        getRowKey={row => row.id}
      />,
    );
    const atlasRenderCountBeforeExpansion = renderName.mock.calls.filter(([row]) => row.id === 2).length;

    fireEvent.click(screen.getByRole("button", { name: "Northstar" }));

    expect(renderName.mock.calls.filter(([row]) => row.id === 2)).toHaveLength(atlasRenderCountBeforeExpansion);
  });

  it("unmounts collapsed mobile details after preserving the accordion exit transition", async () => {
    render(<VireoResponsiveTable {...requiredProps} layout="mobile" titleColumn="name" getRowKey={row => row.id} />);

    const northstarSummary = screen.getByRole("button", { name: "Northstar" });
    expect(screen.queryByText("Maya")).not.toBeInTheDocument();

    fireEvent.click(northstarSummary);
    expect(screen.getByText("Maya")).toBeInTheDocument();

    fireEvent.click(northstarSummary);
    await waitFor(() => expect(screen.queryByText("Maya")).not.toBeInTheDocument());
  });

  it("does not rerender stable mobile rows when its parent rerenders", () => {
    const renderName = vi.fn((row: (typeof rows)[number]) => row.name);
    const stableColumns = [
      { id: "name", renderHeader: () => "Name", renderBody: renderName },
      { id: "owner", renderHeader: () => "Owner", renderBody: (row: (typeof rows)[number]) => row.owner },
    ] as const;
    const stableGetRowKey = (row: (typeof rows)[number]) => row.id;
    const element = (
      <VireoResponsiveTable
        {...requiredProps}
        layout="mobile"
        columns={stableColumns}
        titleColumn="name"
        getRowKey={stableGetRowKey}
      />
    );
    const { rerender } = render(element);
    const renderCountBeforeParentRerender = renderName.mock.calls.length;

    rerender(element);

    expect(renderName).toHaveBeenCalledTimes(renderCountBeforeParentRerender);
  });

  it("mounts every loaded mobile row without virtualization", () => {
    const loadedRows = Array.from({ length: 30 }, (_, index) => ({
      id: index + 1,
      name: `Account ${index + 1}`,
      owner: `Owner ${index + 1}`,
    }));
    const { container } = render(
      <VireoResponsiveTable
        {...requiredProps}
        layout="mobile"
        data={loadedRows}
        titleColumn="name"
        getRowKey={row => row.id}
      />,
    );

    expect(container.querySelectorAll("[data-responsive-table-mobile-row]")).toHaveLength(loadedRows.length);
    expect(screen.getByRole("button", { name: "Account 30" })).toBeInTheDocument();
  });

  it("loads the next mobile page when scrolling near the rendered rows' end", () => {
    const onLoadNextPage = vi.fn();
    const { container } = render(
      <VireoResponsiveTable
        {...requiredProps}
        layout="mobile"
        titleColumn="name"
        getRowKey={row => row.id}
        hasNextPage
        onLoadNextPage={onLoadNextPage}
      />,
    );
    onLoadNextPage.mockClear();

    const viewport = container.querySelector<HTMLElement>("[data-responsive-table-mobile-viewport]")!;
    Object.defineProperties(viewport, {
      scrollHeight: { configurable: true, value: 1_000 },
      clientHeight: { configurable: true, value: 300 },
      scrollTop: { configurable: true, writable: true, value: 550 },
    });
    fireEvent.scroll(viewport);

    expect(onLoadNextPage).toHaveBeenCalledOnce();
  });

  it("keeps ordinary two-line desktop cells expanded without a false truncation action", () => {
    const scrollHeight = vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(44);

    try {
      render(<VireoResponsiveTable {...requiredProps} />);
      expect(screen.queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
    } finally {
      scrollHeight.mockRestore();
    }
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

  it("supports actionable empty content and shared per-row visual feedback", () => {
    const { rerender } = render(
      <VireoResponsiveTable
        {...requiredProps}
        getRowSx={item => (item.id === 1 ? { backgroundColor: "rgb(245, 250, 255)" } : undefined)}
      />,
    );
    expect(screen.getByText("Northstar").closest("tr")).toHaveStyle({ backgroundColor: "rgb(245, 250, 255)" });

    rerender(
      <VireoResponsiveTable
        {...requiredProps}
        data={[]}
        renderEmptyState={() => <button type="button">Create account</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
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
