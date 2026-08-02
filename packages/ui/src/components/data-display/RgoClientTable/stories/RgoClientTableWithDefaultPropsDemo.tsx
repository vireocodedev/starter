import { RgoClientTable, type RgoClientTableProps } from "@/components/data-display/RgoClientTable/RgoClientTable";
import {
  baseColumns,
  sampleUsers,
  USER_KEY_MAPPER,
  type User,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTable.stories.utils";
import { DEFAULT_PAGINATION_OPTIONS } from "@/components/data-display/RgoTable";

type RgoClientTableWithDefaultPropsDemoProps = Partial<
  Omit<RgoClientTableProps<User>, "pagination" | "onPaginationChange">
>;

export function RgoClientTableWithDefaultPropsDemo({
  data = sampleUsers.slice(0, 3),
  columns = baseColumns,
  ...props
}: RgoClientTableWithDefaultPropsDemoProps) {
  const pagination = DEFAULT_PAGINATION_OPTIONS;
  const onPaginationChange = () => {};
  return (
    <RgoClientTable
      {...props}
      keyMapper={USER_KEY_MAPPER}
      data={data}
      columns={columns}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
    />
  );
}

export const RgoClientTableWithDefaultPropsDemoCode = `
import { RgoClientTable, type RgoClientTableProps } from "@vireocodedev/starter-ui";
import {
  baseColumns,
  sampleUsers,
  type User,
} from "@/components/data-display/RgoClientTable/stories/RgoClientTable.stores.utils";

type RgoClientTableWithDefaultPropsDemoProps = Partial<RgoClientTableProps<User>>;

export function RgoClientTableWithDefaultPropsDemo({
  data = sampleUsers.slice(0, 3),
  columns = baseColumns,
  ...props
}: RgoClientTableWithDefaultPropsDemoProps) {
  return <RgoClientTable data={data} columns={columns} {...props} disablePagination />;
}`;
