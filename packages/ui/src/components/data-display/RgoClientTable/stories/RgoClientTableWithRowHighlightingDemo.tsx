import { RgoClientTable } from "@/components/data-display/RgoClientTable/RgoClientTable";
import {
  extendedColumns,
  sampleUsers,
  USER_KEY_MAPPER,
  type User,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTable.stories.utils";

export const RgoClientTableWithRowHighlightingDemo = () => {
  return (
    <RgoClientTable<User>
      keyMapper={USER_KEY_MAPPER}
      data={sampleUsers}
      columns={extendedColumns}
      highlighted={(user: User) => user.status === "active"}
      disablePagination={true}
    />
  );
};

export const RgoClientTableWithRowHighlightingDemoCode = `import { RgoClientTable } from "@/components/data-display/RgoClientTable/RgoClientTable";
import {
  extendedColumns,
  sampleUsers,
  type User,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTable.stores.utils";

export const RgoClientTableWithRowHighlightingDemo = () => {
  return (
    <RgoClientTable<User>
      data={sampleUsers}
      columns={extendedColumns}
      highlighted={(user: User) => user.status === "active"}
      disablePagination={true}
    />
  );
};`;
