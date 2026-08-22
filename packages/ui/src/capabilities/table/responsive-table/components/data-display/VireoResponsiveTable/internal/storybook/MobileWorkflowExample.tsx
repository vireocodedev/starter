import { VireoResponsiveTable, type VireoResponsiveTableFilters } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Chip, Stack, TextField, Typography } from "@mui/material";
import React from "react";

const rows = [
  { id: "CUS-10482", customer: "Northstar Analytics", owner: "Maya Chen", status: "Active", value: "$48,600" },
  { id: "CUS-10483", customer: "Atlas Workshop", owner: "Niko Barić", status: "Review", value: "$31,250" },
  { id: "CUS-10484", customer: "Harbor Health", owner: "Sora Tanaka", status: "At risk", value: "$72,900" },
];

const columns = [
  {
    id: "customer",
    sort: "customer",
    renderHeader: () => "Customer",
    renderBody: (row: (typeof rows)[number]) => (
      <Stack>
        <Typography fontWeight={700}>{row.customer}</Typography>
        <Typography variant="caption" color="text.secondary">
          {row.id}
        </Typography>
      </Stack>
    ),
  },
  { id: "owner", sort: "owner", renderHeader: () => "Owner", renderBody: (row: (typeof rows)[number]) => row.owner },
  {
    id: "status",
    renderHeader: () => "Status",
    renderBody: (row: (typeof rows)[number]) => <Chip label={row.status} size="small" />,
  },
  {
    id: "value",
    sort: "value",
    renderHeader: () => "Annual value",
    renderBody: (row: (typeof rows)[number]) => row.value,
  },
  { id: "actions", renderHeader: () => "Actions", renderBody: () => <Button size="small">Open customer</Button> },
] as const;

const labels = {
  table: "Customer accounts",
  loadingTable: "Loading customer accounts",
  noData: "No customers found",
  showMore: "Show more",
  showLess: "Show less",
  rowsPerPage: "Rows per page",
  paginationMoreThan: (from: number, to: number) => `${from}–${to} of more than ${to}`,
  paginationRange: (from: number, to: number, count: number) => `${from}–${to} of ${count}`,
  paginationItem: (type: "first" | "last" | "next" | "previous") => `Go to ${type} page`,
  filters: "Filters",
  clearFilters: "Clear",
  filtersDone: "Apply filters",
  sortBy: "Sort by",
  sortDirection: "Sort direction",
  ascending: "Ascending",
  descending: "Descending",
  ascendingSortDirection: "Sort ascending",
  descendingSortDirection: "Sort descending",
};

export default function MobileWorkflowExample() {
  const [filters, setFilters] = React.useState<VireoResponsiveTableFilters>({
    page: 0,
    rowsPerPage: 10,
    sortBy: "customer",
    sortDirection: "asc",
  });
  return (
    <VireoStorybookProvider>
      <VireoResponsiveTable
        layout="mobile"
        sx={{
          height: 520,
          maxWidth: 520,
          mx: "auto",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
        columns={columns}
        data={rows}
        filters={filters}
        onFiltersChange={setFilters}
        labels={labels}
        layers={{ stickyToolbar: 4, stickyRowHeader: 3 }}
        renderMobileSearch={() => (
          <TextField
            hiddenLabel
            fullWidth
            size="small"
            placeholder="Search customers"
            inputProps={{ "aria-label": "Search customers" }}
          />
        )}
        renderMobileFilters={() => (
          <Typography color="text.secondary">Account-status filters can be rendered here.</Typography>
        )}
        filtersCount={1}
        onClearFilters={() => undefined}
        getRowKey={row => row.id}
        titleColumn="customer"
        titleEndAdornmentColumn="value"
        actionsColumn="actions"
      />
    </VireoStorybookProvider>
  );
}
