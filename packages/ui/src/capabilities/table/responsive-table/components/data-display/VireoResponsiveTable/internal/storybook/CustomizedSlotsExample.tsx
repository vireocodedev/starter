import { VireoResponsiveTable, type VireoResponsiveTableLabels } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

const rows = [{ id: 1, project: "Atlas migration", owner: "Maya Chen" }];
const columns = [
  { id: "project", renderHeader: () => "Project", renderBody: (row: (typeof rows)[number]) => row.project },
  { id: "owner", renderHeader: () => "Owner", renderBody: (row: (typeof rows)[number]) => row.owner },
] as const;
const labels: VireoResponsiveTableLabels = {
  table: "Projects",
  loadingTable: "Loading projects",
  noData: "No projects",
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

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoResponsiveTable
        layout="desktop"
        sx={{ height: 260 }}
        columns={columns}
        data={rows}
        filters={{ page: 0, rowsPerPage: 10, sortBy: "project", sortDirection: "asc" }}
        onFiltersChange={() => undefined}
        labels={labels}
        layers={{ stickyToolbar: 4, stickyRowHeader: 3 }}
        slots={{ root: "section" }}
        slotProps={{
          root: ownerState => ({
            "aria-label": `${ownerState.layout} project table`,
            sx: { border: 2, borderColor: "primary.main", borderRadius: 3, p: 2 },
          }),
        }}
      />
    </VireoStorybookProvider>
  );
}
