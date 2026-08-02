import { RgoClientTable } from "@/components/data-display/RgoClientTable/RgoClientTable";
import {
  baseColumns,
  sampleUsers,
  USER_KEY_MAPPER,
  type User,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTable.stories.utils";

export const RgoClientTableWithSmallSizeDemo = () => {
  return (
    <RgoClientTable<User>
      keyMapper={USER_KEY_MAPPER}
      data={sampleUsers.slice(0, 3)}
      columns={baseColumns}
      size="small"
      disablePagination={true}
    />
  );
};

export const RgoClientTableWithSmallSizeDemoCode = `import { RgoClientTable } from "@/components/data-display/RgoClientTable/RgoClientTable";
import {
  baseColumns,
  sampleUsers,
  type User,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTable.stores.utils";

export const RgoClientTableWithSmallSizeDemo = () => {
  return (
    <RgoClientTable<User>
      data={sampleUsers.slice(0, 3)}
      columns={baseColumns}
      size="small"
      disablePagination={true}
    />
  );
};`;
