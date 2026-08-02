import { RgoClientTable } from "@/components/data-display/RgoClientTable/RgoClientTable";
import {
  extendedColumns,
  sampleUsers,
  USER_KEY_MAPPER,
  type User,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTable.stories.utils";

export const RgoClientTableWithSortingDemo = () => {
  return (
    <RgoClientTable<User>
      keyMapper={USER_KEY_MAPPER}
      data={sampleUsers}
      columns={extendedColumns}
      disablePagination={true}
    />
  );
};

export const RgoClientTableWithSortingDemoCode = `import { RgoClientTable } from "@/components/data-display/RgoClientTable/RgoClientTable";
import {
  extendedColumns,
  sampleUsers,
  type User,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTable.stores.utils";

export const RgoClientTableWithSortingDemo = () => {
  return (
    <RgoClientTable<User>
      data={sampleUsers}
      columns={extendedColumns}
      disablePagination={true}
    />
  );
};`;
