import { VireoResponsiveTable, type VireoResponsiveTableLabels } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, Button, Stack, Typography } from "@mui/material";

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
const filters = { page: 0, rowsPerPage: 3, sortBy: "customer", sortDirection: "asc" as const };

export default function LoadingAndEmptyExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              mb: 1,
            }}
          >
            Loading
          </Typography>
          <VireoResponsiveTable
            layout="desktop"
            sx={{ height: 300 }}
            columns={columns}
            data={[]}
            filters={filters}
            onFiltersChange={() => undefined}
            labels={labels}
            layers={{ stickyToolbar: 4, stickyRowHeader: 3 }}
            skeleton
          />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              mb: 1,
            }}
          >
            Empty result
          </Typography>
          <VireoResponsiveTable
            layout="desktop"
            sx={{ height: 220 }}
            columns={columns}
            data={[]}
            filters={filters}
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
      </Stack>
    </VireoStorybookProvider>
  );
}
