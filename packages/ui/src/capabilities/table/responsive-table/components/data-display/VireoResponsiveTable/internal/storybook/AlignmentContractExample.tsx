import { Box, Stack, Typography } from "@mui/material";
import { VireoResponsiveTable, type VireoResponsiveTableLabels } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const rows = [
  { id: 1, customer: "Northstar Industries", owner: "Maya" },
  { id: 2, customer: "Atlas Works", owner: "Niko" },
  { id: 3, customer: "Harbor Labs", owner: "Iris" },
];
const columns = [
  { id: "customer", renderHeader: () => "Customer", renderBody: (row: (typeof rows)[number]) => row.customer },
  { id: "owner", renderHeader: () => "Owner", renderBody: (row: (typeof rows)[number]) => row.owner },
] as const;
const baseLabels: VireoResponsiveTableLabels = {
  table: "Accounts",
  loadingTable: "Loading alignment table",
  noData: "No accounts",
  showMore: "Show more",
  showLess: "Show less",
  rowsPerPage: "Rows per page",
  paginationMoreThan: (from, to) => `${from}–${to}+`,
  paginationRange: (from, to, count) => `${from}–${to}/${count}`,
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
const filters = { page: 0, rowsPerPage: 3, sortBy: "customer", sortDirection: "asc" as const };

function AlignmentTable({ layout, loading }: { layout: "desktop" | "mobile"; loading: boolean }) {
  return (
    <Box data-alignment-state={loading ? "loading" : "loaded"} sx={{ height: 300, minWidth: 0 }}>
      <VireoResponsiveTable
        layout={layout}
        columns={columns}
        data={loading ? [] : rows}
        filters={filters}
        onFiltersChange={() => undefined}
        labels={{ ...baseLabels, table: `${layout} ${loading ? "loading" : "loaded"} accounts` }}
        layers={{ stickyToolbar: 4, stickyRowHeader: 3 }}
        titleColumn="customer"
        titleEndAdornmentColumn="owner"
        getRowKey={row => row.id}
        skeleton={loading}
      />
    </Box>
  );
}

export default function AlignmentContractExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={3} data-alignment-contract>
        {(["desktop", "mobile"] as const).map(layout => (
          <Stack key={layout} spacing={1} data-alignment-pair={layout}>
            <Typography variant="h6">{layout === "desktop" ? "Desktop" : "Mobile"}</Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: layout === "desktop" ? "repeat(2, minmax(480px, 1fr))" : "repeat(2, 360px)",
                gap: 2,
                overflow: "auto",
              }}
            >
              <AlignmentTable layout={layout} loading={false} />
              <AlignmentTable layout={layout} loading />
            </Box>
          </Stack>
        ))}
      </Stack>
    </VireoStorybookProvider>
  );
}
