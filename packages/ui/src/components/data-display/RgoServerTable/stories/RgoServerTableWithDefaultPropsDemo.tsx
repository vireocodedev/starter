import { RgoServerTable, type RgoServerTableProps } from "@/components/data-display/RgoServerTable/RgoServerTable";
import {
  baseColumns,
  defaultPagination,
  sampleEmployees,
  type Employee,
} from "@/components/data-display/RgoServerTable/stories/RgoServerTable.stories.utils";
import { type PageableParams } from "@/utils/apiutils";
import React from "react";

type RgoServerTableWithDefaultPropsDemoProps = Partial<
  Omit<RgoServerTableProps<Employee>, "pagination" | "onPaginationChange">
>;

export function RgoServerTableWithDefaultPropsDemo({
  data = sampleEmployees.slice(0, 3),
  columns = baseColumns,
  keyMapper = employee => employee.id.toString(),
  count = 3,
  ...props
}: RgoServerTableWithDefaultPropsDemoProps) {
  const [pagination, setPagination] = React.useState<PageableParams>(defaultPagination);

  return (
    <RgoServerTable
      {...props}
      pagination={pagination}
      onPaginationChange={setPagination}
      data={data}
      columns={columns}
      keyMapper={keyMapper}
      count={count}
    />
  );
}

export const RgoServerTableWithDefaultPropsDemoCode = `
import { RgoServerTable, type RgoServerTableProps, type PageableParams } from "@vireocodedev/starter-ui";
import {
  baseColumns,
  defaultPagination,
  sampleEmployees,
  type Employee,
} from "@/components/data-display/RgoServerTable/stories/RgoServerTable.stories.utils";
import React from "react";

type RgoServerTableWithDefaultPropsDemoProps = Partial<
  Omit<RgoServerTableProps<Employee>, "pagination" | "onPaginationChange">
>;

export function RgoServerTableWithDefaultPropsDemo({
  data = sampleEmployees.slice(0, 3),
  columns = baseColumns,
  keyMapper = employee => employee.id.toString(),
  count = 3,
  ...props
}: RgoServerTableWithDefaultPropsDemoProps) {
  const [pagination, setPagination] = React.useState<PageableParams>(defaultPagination);

  return (
    <RgoServerTable
      {...props}
      pagination={pagination}
      onPaginationChange={setPagination}
      data={data}
      columns={columns}
      keyMapper={keyMapper}
      count={count}
    />
  );
}`;
