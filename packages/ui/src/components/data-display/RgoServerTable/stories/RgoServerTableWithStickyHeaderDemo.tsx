import { RgoLabelBox } from "@/core/public";
import { RgoServerTable } from "@/components/data-display/RgoServerTable/RgoServerTable";
import {
  defaultPagination,
  extendedColumns,
  sampleEmployees,
} from "@/components/data-display/RgoServerTable/stories/RgoServerTable.stories.utils";
import type { PageableParams } from "@/utils/apiutils";
import { Stack, Typography } from "@mui/material";
import React from "react";

export const RgoServerTableWithStickyHeaderDemo = () => {
  const [pagination, setPagination] = React.useState<PageableParams>({
    ...defaultPagination,
    rowsPerPage: 8,
  });

  return (
    <Stack spacing={3} p={2}>
      <Typography variant="h5">Server Table with Sticky Header</Typography>
      <Typography variant="body2" color="text.secondary">
        Table headers remain visible while scrolling through data. Try sorting and pagination!
      </Typography>
      <RgoLabelBox label="Sticky Header Table (350px max height)">
        <RgoServerTable
          data={sampleEmployees}
          columns={extendedColumns}
          keyMapper={employee => employee.id.toString()}
          count={8}
          stickyMaxHeight={350}
          size="small"
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </RgoLabelBox>
    </Stack>
  );
};

export const RgoServerTableWithStickyHeaderDemoCode = `import { RgoLabelBox } from "@/core/public";
import { RgoServerTable } from "@/components/data-display/RgoServerTable/RgoServerTable";
import {
  defaultPagination,
  extendedColumns,
  sampleEmployees,
} from "@/components/data-display/RgoServerTable/stories/RgoServerTable.stories.utils";
import type { PageableParams } from "@/utils/apiutils";
import { Stack, Typography } from "@mui/material";
import React from "react";

export const RgoServerTableWithStickyHeaderDemo = () => {
  const [pagination, setPagination] = React.useState<PageableParams>({
    ...defaultPagination,
    rowsPerPage: 8,
  });

  return (
    <Stack spacing={3} p={2}>
      <Typography variant="h5">Server Table with Sticky Header</Typography>
      <Typography variant="body2" color="text.secondary">
        Table headers remain visible while scrolling through data. Try sorting and pagination!
      </Typography>
      <RgoLabelBox label="Sticky Header Table (350px max height)">
        <RgoServerTable
          data={sampleEmployees}
          columns={extendedColumns}
          keyMapper={employee => employee.id.toString()}
          count={8}
          stickyMaxHeight={350}
          size="small"
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </RgoLabelBox>
    </Stack>
  );
};`;
