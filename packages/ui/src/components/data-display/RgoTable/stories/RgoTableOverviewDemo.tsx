import { RgoTableCellSortable } from "@/components/data-display/RgoTable/components/RgoTableCellSortable/RgoTableCellSortable";
import { RgoTablePagination } from "@/components/data-display/RgoTable/components/RgoTablePagination/RgoTablePagination";
import {
  DEFAULT_PAGINATION_OPTIONS,
  type DtBaseColumn,
  type DtBaseSortItem,
  type PaginationProps,
} from "@/components/data-display/RgoTable/index";
import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";

type User = { id: number; name: string; email: string; role: string };

const USERS: User[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? "Admin" : i % 3 === 1 ? "Editor" : "Viewer",
}));

const COLUMNS: DtBaseColumn<User>[] = [
  {
    id: "name",
    HeaderComponent: () => <Typography fontWeight={600}>Name</Typography>,
    BodyComponent: ({ element }) => <span>{element.name}</span>,
    widthPctShare: 30,
    widthPxMin: 150,
  },
  {
    id: "email",
    HeaderComponent: () => <Typography fontWeight={600}>Email</Typography>,
    BodyComponent: ({ element }) => <span>{element.email}</span>,
    widthPctShare: 40,
    widthPxMin: 200,
  },
  {
    id: "role",
    HeaderComponent: () => <Typography fontWeight={600}>Role</Typography>,
    BodyComponent: ({ element }) => <span>{element.role}</span>,
    widthPctShare: 30,
    widthPxMin: 100,
  },
];

export function RgoTableOverviewDemo() {
  const [sort, setSort] = React.useState<DtBaseSortItem[]>([{ id: "name", direction: "asc" }]);
  const [pagination, setPagination] = React.useState<PaginationProps["pagination"]>(DEFAULT_PAGINATION_OPTIONS);

  const sortedData = React.useMemo(() => {
    const [primary] = sort;
    if (!primary) return USERS;
    return [...USERS].sort((a, b) => {
      const aVal = a[primary.id as keyof User] ?? "";
      const bVal = b[primary.id as keyof User] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal));
      return primary.direction === "asc" ? cmp : -cmp;
    });
  }, [sort]);

  const pagedData = sortedData.slice(
    pagination.page * pagination.rowsPerPage,
    (pagination.page + 1) * pagination.rowsPerPage,
  );

  const handleSort = (id: string) => {
    setSort(prev => {
      const existing = prev.find(s => s.id === id);
      if (!existing) return [{ id, direction: "asc" }];
      if (existing.direction === "asc") return [{ id, direction: "desc" }];
      return [];
    });
  };

  return (
    <Stack spacing={0}>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              {COLUMNS.map(col => {
                const sortItem = sort.find(s => s.id === col.id);
                return (
                  <RgoTableCellSortable
                    key={col.id}
                    id={col.id}
                    active={!!sortItem}
                    direction={sortItem?.direction ?? "asc"}
                    onClick={() => handleSort(col.id)}
                    HeaderComponent={col.HeaderComponent}
                    widthPctShare={col.widthPctShare}
                    widthPxMin={col.widthPxMin}
                  />
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedData.map(user => (
              <TableRow key={user.id}>
                {COLUMNS.map(col => (
                  <TableCell key={col.id}>
                    <col.BodyComponent element={user} index={user.id - 1} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <RgoTablePagination count={sortedData.length} pagination={pagination} onPaginationChange={setPagination} />
    </Stack>
  );
}

export const RgoTableOverviewDemoCode = `
import {
  type DtBaseColumn, type DtBaseSortItem,
  DEFAULT_PAGINATION_OPTIONS, type PaginationProps,
  RgoTableCellSortable, RgoTablePagination,
} from "@vireocodedev/starter-ui";
import {
  Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";
import React from "react";

type User = { id: number; name: string; email: string; role: string };

const USERS: User[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: \`User \${i + 1}\`,
  email: \`user\${i + 1}@example.com\`,
  role: i % 3 === 0 ? "Admin" : i % 3 === 1 ? "Editor" : "Viewer",
}));

export function RgoTableOverviewDemo() {
  const [sort, setSort] = React.useState<DtBaseSortItem[]>([]);
  const [pagination, setPagination] = React.useState(DEFAULT_PAGINATION_OPTIONS);

  // Sort and paginate data...
  // Use RgoTableCellSortable for sortable headers
  // Use RgoTablePagination for pagination controls

  return (
    <Stack spacing={0}>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <RgoTableCellSortable id="name" active={...} direction={...} onClick={...} HeaderComponent={...} />
            </TableRow>
          </TableHead>
          <TableBody>{/* Map paginated data */}</TableBody>
        </Table>
      </TableContainer>
      <RgoTablePagination count={...} pagination={pagination} onPaginationChange={setPagination} />
    </Stack>
  );
}`;
