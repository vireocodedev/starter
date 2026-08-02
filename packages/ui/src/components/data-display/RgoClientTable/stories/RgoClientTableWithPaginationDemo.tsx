import { RgoClientTable } from "@/components/data-display/RgoClientTable/RgoClientTable";
import {
  extendedColumns,
  sampleUsers,
  USER_KEY_MAPPER,
  type User,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTable.stories.utils";

export const RgoClientTableWithPaginationDemo = () => {
  return (
    <RgoClientTable<User>
      keyMapper={USER_KEY_MAPPER}
      data={sampleUsers}
      columns={extendedColumns}
      disablePagination={false}
      pagination={{
        page: 0,
        rowsPerPage: 3,
        sortBy: "name",
        sortDirection: "asc",
      }}
      onPaginationChange={() => {}}
      rowsPerPageOptions={[3, 5, 10, 25]}
    />
  );
};

export const RgoClientTableWithPaginationDemoCode = `import { RgoClientTable } from "@/components/data-display/RgoClientTable/RgoClientTable";
import {
  extendedColumns,
  sampleUsers,
  type User,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTable.stores.utils";

export const RgoClientTableWithPaginationDemo = () => {
  return (
    <RgoClientTable<User>
      data={sampleUsers}
      columns={extendedColumns}
      disablePagination={false}
      pagination={{
        page: 0,
        rowsPerPage: 3,
        sortBy: "name",
        sortDirection: "asc",
      }}
      onPaginationChange={() => {}}
      rowsPerPageOptions={[3, 5, 10, 25]}
    />
  );
};`;
