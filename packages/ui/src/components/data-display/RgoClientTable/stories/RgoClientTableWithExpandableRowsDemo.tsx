import { RgoClientTable } from "@/components/data-display/RgoClientTable/RgoClientTable";
import {
  baseColumns,
  sampleUsers,
  USER_KEY_MAPPER,
  UserDetailsAccordion,
  type User,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTable.stories.utils";

export const RgoClientTableWithExpandableRowsDemo = () => {
  return (
    <RgoClientTable<User>
      //size="small"
      keyMapper={USER_KEY_MAPPER}
      data={sampleUsers.slice(0, 4)}
      columns={baseColumns}
      AccordionComponent={UserDetailsAccordion}
      disablePagination={true}
      isRowExpandable={element => element.name !== "Jane Smith"}
    />
  );
};

export const RgoClientTableWithExpandableRowsDemoCode = `import { RgoClientTable } from "@/components/data-display/RgoClientTable/RgoClientTable";
import {
  baseColumns,
  sampleUsers,
  UserDetailsAccordion,
  type User,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTable.stores.utils";

export const RgoClientTableWithExpandableRowsDemo = () => {
  return (
    <RgoClientTable<User>
      data={sampleUsers.slice(0, 4)}
      columns={baseColumns}
      AccordionComponent={UserDetailsAccordion}
      disablePagination={true}
      isRowExpandable={element => element.name !== "Jane Smith"}
    />
  );
};`;
