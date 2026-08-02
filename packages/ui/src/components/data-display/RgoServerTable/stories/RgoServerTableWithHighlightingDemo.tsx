import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoServerTable } from "@/components/data-display/RgoServerTable/RgoServerTable";
import {
  defaultPagination,
  extendedColumns,
  sampleEmployees,
} from "@/components/data-display/RgoServerTable/stories/RgoServerTable.stories.utils";
import type { PageableParams } from "@/utils/apiutils";
import { Stack, Typography } from "@mui/material";
import React from "react";

export const RgoServerTableWithHighlightingDemo = () => {
  const [pagination, setPagination] = React.useState<PageableParams>({
    ...defaultPagination,
    rowsPerPage: 8,
  });

  return (
    <Stack spacing={3} p={2}>
      <Typography variant="h5">Server Table with Row Highlighting</Typography>
      <Typography variant="body2" color="text.secondary">
        Employees with salary over $90,000 are highlighted. Try sorting by salary to see the effect!
      </Typography>
      <RgoLabelBox label="High-Salary Employee Highlighting">
        <RgoServerTable
          data={sampleEmployees}
          columns={extendedColumns}
          keyMapper={employee => employee.id.toString()}
          count={8}
          highlighted={employee => employee.salary > 90000}
          size="small"
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </RgoLabelBox>
    </Stack>
  );
};

export const RgoServerTableWithHighlightingDemoCode = `import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoServerTable } from "@/components/data-display/RgoServerTable/RgoServerTable";
import {
  defaultPagination,
  extendedColumns,
  sampleEmployees,
} from "@/components/data-display/RgoServerTable/stories/RgoServerTable.stories.utils";
import type { PageableParams } from "@/utils/apiutils";
import { Stack, Typography } from "@mui/material";
import React from "react";

export const RgoServerTableWithHighlightingDemo = () => {
  const [pagination, setPagination] = React.useState<PageableParams>({
    ...defaultPagination,
    rowsPerPage: 8,
  });

  return (
    <Stack spacing={3} p={2}>
      <Typography variant="h5">Server Table with Row Highlighting</Typography>
      <Typography variant="body2" color="text.secondary">
        Employees with salary over $90,000 are highlighted. Try sorting by salary to see the effect!
      </Typography>
      <RgoLabelBox label="High-Salary Employee Highlighting">
        <RgoServerTable
          data={sampleEmployees}
          columns={extendedColumns}
          keyMapper={employee => employee.id.toString()}
          count={8}
          highlighted={employee => employee.salary > 90000}
          size="small"
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </RgoLabelBox>
    </Stack>
  );
};`;
