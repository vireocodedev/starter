import { VireoResponsiveTable, type VireoResponsiveTableLabels } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";

const rows = [{ id: 1, release: "August launch", readiness: "Ready" }];
const columns = [
  { id: "release", renderHeader: () => "Release", renderBody: (row: (typeof rows)[number]) => row.release },
  { id: "readiness", renderHeader: () => "Readiness", renderBody: (row: (typeof rows)[number]) => row.readiness },
] as const;
const labels: VireoResponsiveTableLabels = {
  table: "Releases",
  loadingTable: "Loading releases",
  noData: "No releases",
  showMore: "Show more",
  showLess: "Show less",
  rowsPerPage: "Rows per page",
  paginationMoreThan: (from, to) => `${from}–${to} of more than ${to}`,
  paginationRange: (from, to, count) => `${from}–${to} of ${count}`,
  paginationItem: type => `Go to ${type} page`,
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
export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider
        theme={outerTheme =>
          createTheme(outerTheme as Theme, {
            components: {
              VireoResponsiveTable: {
                defaultProps: { className: "release-table" },
                styleOverrides: { root: { border: "2px solid #a78bfa", borderRadius: 16, padding: 12 } },
              },
            },
          })
        }
      >
        <VireoResponsiveTable
          layout="desktop"
          sx={{ height: 260 }}
          columns={columns}
          data={rows}
          filters={{ page: 0, rowsPerPage: 10, sortBy: "release", sortDirection: "asc" }}
          onFiltersChange={() => undefined}
          labels={labels}
          layers={{ stickyToolbar: 4, stickyRowHeader: 3 }}
        />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
