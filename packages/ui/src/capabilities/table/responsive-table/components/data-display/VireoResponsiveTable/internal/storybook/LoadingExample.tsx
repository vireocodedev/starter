import { Box } from "@mui/material";
import { VireoResponsiveTable, type VireoResponsiveTableLabels } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

const columns = [
  { id: "customer", renderHeader: () => "Customer", renderBody: (row: { customer: string }) => row.customer },
  { id: "owner", renderHeader: () => "Owner", renderBody: (row: { owner: string }) => row.owner },
] as const;
const labels: VireoResponsiveTableLabels = {
  table: "Customer accounts",
  loadingTable: "Loading customer accounts",
  noData: "No matching customers",
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
const filters = { page: 0, rowsPerPage: 4, sortBy: "customer", sortDirection: "asc" as const };

export default function LoadingExample() {
  return (
    <VireoStorybookProvider>
      <Box sx={{ height: 330 }}>
        <VireoResponsiveTable
          layout="desktop"
          columns={columns}
          data={[]}
          filters={filters}
          onFiltersChange={() => undefined}
          labels={labels}
          layers={{ stickyToolbar: 4, stickyRowHeader: 3 }}
          skeleton
        />
      </Box>
    </VireoStorybookProvider>
  );
}
