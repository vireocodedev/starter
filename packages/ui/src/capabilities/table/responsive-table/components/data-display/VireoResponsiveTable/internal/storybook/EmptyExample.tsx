import { Box, Button, Stack, Typography } from "@mui/material";
import { VireoResponsiveTable, type VireoResponsiveTableLabels } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

const columns = [
  { id: "customer", renderHeader: () => "Customer", renderBody: (row: { customer: string }) => row.customer },
  { id: "owner", renderHeader: () => "Owner", renderBody: (row: { owner: string }) => row.owner },
] as const;
const labels: VireoResponsiveTableLabels = {
  table: "Customer accounts",
  loadingTable: "Loading customer accounts",
  loadingNextPage: "Loading more customer accounts",
  loadedNextPage: "More customer accounts loaded",
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

export default function EmptyExample() {
  return (
    <VireoStorybookProvider>
      <Box sx={{ height: 260 }}>
        <VireoResponsiveTable
          layout="desktop"
          columns={columns}
          data={[]}
          filters={{ page: 0, rowsPerPage: 4, sortBy: "customer", sortDirection: "asc" }}
          onFiltersChange={() => undefined}
          labels={labels}
          layers={{ stickyToolbar: 4, stickyRowHeader: 3 }}
          renderEmptyState={() => (
            <Stack spacing={1} sx={{ alignItems: "center" }}>
              <Typography color="text.secondary">No matching customers</Typography>
              <Button size="small">Clear search</Button>
            </Stack>
          )}
        />
      </Box>
    </VireoStorybookProvider>
  );
}
