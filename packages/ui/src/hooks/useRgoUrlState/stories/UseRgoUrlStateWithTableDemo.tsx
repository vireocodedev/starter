import { RgoServerTable } from "@/components/data-display/RgoServerTable/RgoServerTable";
import { DEFAULT_PAGINATION_OPTIONS } from "@/components/data-display/RgoTable";
import { useRgoUrlState } from "@/hooks/useRgoUrlState/useRgoUrlState";
import { type TODO } from "@/utils/typeutils";
import { Chip, Divider, Typography } from "@mui/material";
import React from "react";

type User = {
  id: number;
  name: string;
  email: string;
  address: string;
  active: boolean;
};

const MOCK_USERS: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com", address: "123 Main St", active: true },
  { id: 2, name: "Bob", email: "bob@example.com", address: "456 Elm St", active: false },
  { id: 3, name: "Charlie", email: "charlie@example.com", address: "789 Oak St", active: true },
  { id: 4, name: "David", email: "david@example.com", address: "101 Pine St", active: false },
  { id: 5, name: "Eve", email: "eve@example.com", address: "202 Maple St", active: true },
  { id: 6, name: "Frank", email: "frank@example.com", address: "303 Cedar St", active: false },
  { id: 7, name: "Grace", email: "grace@example.com", address: "404 Birch St", active: true },
  { id: 8, name: "Hank", email: "hank@example.com", address: "505 Willow St", active: false },
  { id: 9, name: "Ivy", email: "ivy@example.com", address: "606 Palm St", active: true },
  { id: 10, name: "Jack", email: "jack@example.com", address: "707 Spruce St", active: false },
];

const USERS = [
  ...MOCK_USERS,
  ...MOCK_USERS.map(user => ({ ...user, id: user.id + 10, name: `${user.name} (copy ${user.id + 10})` })),
  ...MOCK_USERS.map(user => ({ ...user, id: user.id + 20, name: `${user.name} (copy ${user.id + 20})` })),
  ...MOCK_USERS.map(user => ({ ...user, id: user.id + 30, name: `${user.name} (copy ${user.id + 30})` })),
  ...MOCK_USERS.map(user => ({ ...user, id: user.id + 40, name: `${user.name} (copy ${user.id + 40})` })),
  ...MOCK_USERS.map(user => ({ ...user, id: user.id + 50, name: `${user.name} (copy ${user.id + 50})` })),
  ...MOCK_USERS.map(user => ({ ...user, id: user.id + 60, name: `${user.name} (copy ${user.id + 60})` })),
  ...MOCK_USERS.map(user => ({ ...user, id: user.id + 70, name: `${user.name} (copy ${user.id + 70})` })),
  ...MOCK_USERS.map(user => ({ ...user, id: user.id + 80, name: `${user.name} (copy ${user.id + 80})` })),
  ...MOCK_USERS.map(user => ({ ...user, id: user.id + 90, name: `${user.name} (copy ${user.id + 90})` })),
];

export function UseUrlStateWithTableDemo() {
  const [pagination, setPagination] = useRgoUrlState("pagination", DEFAULT_PAGINATION_OPTIONS);

  const filteredUsers = React.useMemo(() => {
    const { page, rowsPerPage, sortBy, sortDirection } = pagination;
    const usersCopy = [...USERS];

    const start = page * rowsPerPage;
    const end = start + rowsPerPage;

    const sortedUsers =
      sortBy === ""
        ? usersCopy
        : usersCopy.sort((a: TODO, b: TODO) => {
            if (sortDirection === "asc") {
              return String(a[sortBy]).localeCompare(String(b[sortBy]));
            } else {
              return String(b[sortBy]).localeCompare(String(a[sortBy]));
            }
          });

    return sortedUsers.slice(start, end);
  }, [pagination]);

  return (
    <>
      <Typography
        variant="h6"
        gutterBottom
        sx={({ palette }) => ({
          color: palette.common.black,
        })}
      >
        Table with pagination and sorting via URL state
      </Typography>

      <Divider sx={{ my: 2 }} />

      <RgoServerTable
        data={filteredUsers}
        count={USERS.length}
        keyMapper={user => String(user.id)}
        pagination={pagination}
        onPaginationChange={setPagination}
        columns={[
          {
            id: "id",
            sort: "id",
            HeaderComponent: () => <strong>ID</strong>,
            BodyComponent: ({ element }) => <span>{element.id}</span>,
            widthPctShare: 0,
            widthPxMin: 0,
          },
          {
            id: "name",
            sort: "name",
            HeaderComponent: () => <strong>Name</strong>,
            BodyComponent: ({ element }) => <span>{element.name}</span>,
            widthPctShare: 0,
            widthPxMin: 0,
          },
          {
            id: "email",
            sort: "email",
            HeaderComponent: () => <strong>Email</strong>,
            BodyComponent: ({ element }) => <span>{element.email}</span>,
            widthPctShare: 0,
            widthPxMin: 0,
          },
          {
            id: "address",
            sort: "address",
            HeaderComponent: () => <strong>Address</strong>,
            BodyComponent: ({ element }) => <span>{element.address}</span>,
            widthPctShare: 0,
            widthPxMin: 0,
          },
          {
            id: "active",
            sort: "active",
            HeaderComponent: () => <strong>Active</strong>,
            BodyComponent: ({ element }) => (
              <Chip label={element.active ? "Yes" : "No"} color={element.active ? "success" : "error"} size="small" />
            ),
            widthPctShare: 0,
            widthPxMin: 0,
          },
        ]}
      />
    </>
  );
}

export const UseUrlStateWithTableDemoCode = `
import { RgoServerTable, DEFAULT_PAGINATION_OPTIONS, useRgoUrlState } from "@vireocodedev/starter-ui";

export function UseUrlStateWithTableDemo() {
  const [pagination, setPagination] = useRgoUrlState("pagination", DEFAULT_PAGINATION_OPTIONS);

  // const data = ...
  // const columns = ...
  // const count = ...
  // const keyMapper = ...

  return (
    <RgoServerTable
      pagination={pagination}
      onPaginationChange={setPagination}
      data={data}
      columns={columns}
      count={count}
      keyMapper={keyMapper}
    />
  );
}`;
