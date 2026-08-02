import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoServerTable } from "@/components/data-display/RgoServerTable/RgoServerTable";
import {
  defaultPagination,
  EmployeeDetailsAccordion,
  extendedColumns,
  sampleEmployees,
} from "@/components/data-display/RgoServerTable/stories/RgoServerTable.stories.utils";
import type { PageableParams } from "@/utils/apiutils";
import { Stack, Typography } from "@mui/material";
import React from "react";

export const RgoServerTableWithExpandableRowsDemo = () => {
  const [pagination, setPagination] = React.useState<PageableParams>(defaultPagination);

  return (
    <Stack spacing={3} p={2}>
      <Typography variant="h5">Server Table with Expandable Rows</Typography>
      <RgoLabelBox label="Click rows to expand and view detailed information">
        <RgoServerTable
          data={sampleEmployees.slice(0, 4)}
          columns={extendedColumns}
          keyMapper={employee => employee.id.toString()}
          count={25}
          AccordionComponent={EmployeeDetailsAccordion}
          size="medium"
          pagination={pagination}
          onPaginationChange={setPagination}
          isRowExpandable={element => element.name !== "Jane Smith"}
        />
      </RgoLabelBox>
    </Stack>
  );
};

export const RgoServerTableWithExpandableRowsDemoCode = `import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoServerTable } from "@/components/data-display/RgoServerTable/RgoServerTable";
import {
  defaultPagination,
  type Employee,
  EmployeeDetailsAccordion,
  extendedColumns,
  sampleEmployees,
} from "@/components/data-display/RgoServerTable/stories/RgoServerTable.stories.utils";
import type { PageableParams } from "@/utils/apiutils";
import { Stack, Typography } from "@mui/material";
import React from "react";

export const RgoServerTableWithExpandableRowsDemo = () => {
  const [pagination, setPagination] = React.useState<PageableParams>(defaultPagination);

  return (
    <Stack spacing={3} p={2}>
      <Typography variant="h5">Server Table with Expandable Rows</Typography>
      <RgoLabelBox label="Click rows to expand and view detailed information">
        <RgoServerTable
          data={sampleEmployees.slice(0, 4)}
          columns={extendedColumns}
          keyMapper={employee => employee.id.toString()}
          count={25}
          AccordionComponent={EmployeeDetailsAccordion}
          size="medium"
          pagination={pagination}
          onPaginationChange={setPagination}
          isRowExpandable={element => element.name !== "Jane Smith"}
        />
      </RgoLabelBox>
    </Stack>
  );
};`;
