import {
  VireoResponsiveTable,
  type VireoResponsiveTableFilters,
  type VireoResponsiveTableLabels,
} from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Button, Chip, Stack, Typography } from "@mui/material";
import React from "react";

const rows = [
  { id: "CUS-10482", customer: "Northstar Analytics", owner: "Maya Chen", status: "Active", value: "$48,600" },
  { id: "CUS-10483", customer: "Atlas Workshop", owner: "Niko Barić", status: "Review", value: "$31,250" },
  { id: "CUS-10484", customer: "Harbor Health", owner: "Sora Tanaka", status: "Active", value: "$72,900" },
];

const columns = [
  {
    id: "customer",
    sort: "customer",
    minWidthPx: 230,
    renderHeader: () => "Customer",
    renderBody: (row: (typeof rows)[number]) => (
      <Stack>
        <Typography
          sx={{
            fontWeight: 700,
          }}
        >
          {row.customer}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {row.id}
        </Typography>
      </Stack>
    ),
  },
  {
    id: "owner",
    sort: "owner",
    minWidthPx: 170,
    renderHeader: () => "Owner",
    renderBody: (row: (typeof rows)[number]) => row.owner,
  },
  {
    id: "status",
    minWidthPx: 120,
    renderHeader: () => "Status",
    renderBody: (row: (typeof rows)[number]) => (
      <Chip label={row.status} color={row.status === "Active" ? "success" : "warning"} size="small" />
    ),
  },
  {
    id: "value",
    sort: "value",
    align: "right" as const,
    minWidthPx: 130,
    renderHeader: () => "Annual value",
    renderBody: (row: (typeof rows)[number]) => (
      <Typography
        sx={{
          fontWeight: 700,
        }}
      >
        {row.value}
      </Typography>
    ),
  },
  {
    id: "actions",
    align: "right" as const,
    fixedWidth: true,
    minWidthPx: 110,
    renderHeader: () => "Actions",
    renderBody: () => <Button size="small">Open</Button>,
  },
] as const;

const labels: VireoResponsiveTableLabels = {
  table: "Customer accounts",
  loadingTable: "Loading customer accounts",
  loadingNextPage: "Loading more customer accounts",
  loadedNextPage: "More customer accounts loaded",
  noData: "No customers found",
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

export default function DefaultExample() {
  const [filters, setFilters] = React.useState<VireoResponsiveTableFilters>({
    page: 0,
    rowsPerPage: 10,
    sortBy: "customer",
    sortDirection: "asc",
  });
  return (
    <VireoStorybookProvider>
      <VireoResponsiveTable
        layout="desktop"
        sx={{ height: 460 }}
        columns={columns}
        data={rows}
        filters={filters}
        onFiltersChange={setFilters}
        labels={labels}
        layers={{ stickyToolbar: 4, stickyRowHeader: 3 }}
        getRowKey={row => row.id}
        titleColumn="customer"
        titleEndAdornmentColumn="value"
        actionsColumn="actions"
      />
    </VireoStorybookProvider>
  );
}
