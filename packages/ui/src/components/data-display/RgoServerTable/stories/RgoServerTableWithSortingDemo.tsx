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

export const RgoServerTableWithSortingDemo = () => {
  const [pagination, setPagination] = React.useState<PageableParams>({
    ...defaultPagination,
    sortBy: "salary",
    sortDirection: "desc",
  });

  return (
    <Stack spacing={3} p={2}>
      <Typography variant="h5">Server Table with Sorting</Typography>
      <Typography variant="body2" color="text.secondary">
        Click column headers to sort. Try sorting by different columns!
      </Typography>
      <RgoLabelBox label="Sortable Employee Data">
        <RgoServerTable
          data={sampleEmployees.slice(0, 6)}
          columns={extendedColumns}
          keyMapper={employee => employee.id.toString()}
          count={100}
          rowsPerPageOptions={[3, 6, 10]}
          size="small"
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </RgoLabelBox>
    </Stack>
  );
};

export const RgoServerTableWithSortingDemoCode = `import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoServerTable } from "@/components/data-display/RgoServerTable/RgoServerTable";
import {
  defaultPagination,
  extendedColumns,
  sampleEmployees,
} from "@/components/data-display/RgoServerTable/stories/RgoServerTable.stories.utils";
import type { PageableParams } from "@/utils/apiutils";
import { Stack, Typography } from "@mui/material";
import React from "react";

export const RgoServerTableWithSortingDemo = () => {
  const [pagination, setPagination] = React.useState<PageableParams>({
    ...defaultPagination,
    sortBy: "salary",
    sortDirection: "desc",
  });

  return (
    <Stack spacing={3} p={2}>
      <Typography variant="h5">Server Table with Sorting</Typography>
      <Typography variant="body2" color="text.secondary">
        Click column headers to sort. Try sorting by different columns!
      </Typography>
      <RgoLabelBox label="Sortable Employee Data">
        <RgoServerTable
          data={sampleEmployees.slice(0, 6)}
          columns={extendedColumns}
          keyMapper={employee => employee.id.toString()}
          count={100}
          rowsPerPageOptions={[3, 6, 10]}
          size="small"
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </RgoLabelBox>
    </Stack>
  );
};`;
