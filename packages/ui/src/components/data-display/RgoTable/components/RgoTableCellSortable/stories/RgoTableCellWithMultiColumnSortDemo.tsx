import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoTableCellSortable } from "@/components/data-display/RgoTable/components/RgoTableCellSortable/RgoTableCellSortable";
import { DateRange } from "@mui/icons-material";
import { Box, Table, TableHead, TableRow, Typography } from "@mui/material";
import React from "react";

export function RgoTableCellWithMultiColumnSortDemo() {
  const [sortStates, setSortStates] = React.useState({
    primary: { active: true, direction: "asc" as "asc" | "desc", priority: 1 },
    secondary: { active: true, direction: "desc" as "asc" | "desc", priority: 2 },
    tertiary: { active: true, direction: "asc" as "asc" | "desc", priority: 3 },
  });

  const handleColumnClick = (columnId: keyof typeof sortStates) => {
    setSortStates(prev => {
      const newStates = { ...prev };

      if (newStates[columnId].active) {
        // Toggle direction if already active
        newStates[columnId] = {
          ...newStates[columnId],
          direction: newStates[columnId].direction === "asc" ? "desc" : "asc",
        };
      } else {
        // Activate column and assign next priority
        const maxPriority = Math.max(...Object.values(newStates).map(s => s.priority || 0));
        newStates[columnId] = {
          active: true,
          direction: "asc",
          priority: maxPriority + 1,
        };
      }

      return newStates;
    });

    console.log(`Clicked: ${columnId}`);
  };

  return (
    <RgoLabelBox label="Multi-Column Sort with Priorities">
      <Table>
        <TableHead>
          <TableRow>
            <RgoTableCellSortable
              id="primary"
              direction={sortStates.primary.direction}
              active={sortStates.primary.active}
              onClick={() => handleColumnClick("primary")}
              priority={sortStates.primary.priority}
              widthPctShare={33.33}
              widthPxMin={150}
              HeaderComponent={() => (
                <Typography variant="body2" fontWeight={600}>
                  Name
                </Typography>
              )}
            />
            <RgoTableCellSortable
              id="secondary"
              direction={sortStates.secondary.direction}
              active={sortStates.secondary.active}
              onClick={() => handleColumnClick("secondary")}
              align="center"
              priority={sortStates.secondary.priority}
              widthPctShare={33.33}
              widthPxMin={150}
              HeaderComponent={() => (
                <Box display="flex" alignItems="center" gap={1}>
                  <DateRange fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>
                    Date Created
                  </Typography>
                </Box>
              )}
            />
            <RgoTableCellSortable
              id="tertiary"
              direction={sortStates.tertiary.direction}
              active={sortStates.tertiary.active}
              onClick={() => handleColumnClick("tertiary")}
              align="right"
              priority={sortStates.tertiary.priority}
              widthPctShare={33.33}
              widthPxMin={150}
              HeaderComponent={() => (
                <Typography variant="body2" fontWeight={600}>
                  Status
                </Typography>
              )}
            />
          </TableRow>
        </TableHead>
      </Table>
    </RgoLabelBox>
  );
}

export const RgoTableCellWithMultiColumnSortDemoCode = `
import { RgoLabelBox, RgoTableCellSortable } from "@vireocodedev/starter-ui";
import { DateRange } from "@mui/icons-material";
import { Box, Table, TableHead, TableRow, Typography } from "@mui/material";
import React from "react";

export function RgoTableCellWithMultiColumnSortDemo() {
  const [sortStates, setSortStates] = React.useState({
    primary: { active: true, direction: "asc" as "asc" | "desc", priority: 1 },
    secondary: { active: true, direction: "desc" as "asc" | "desc", priority: 2 },
    tertiary: { active: true, direction: "asc" as "asc" | "desc", priority: 3 },
  });

  const handleColumnClick = (columnId: keyof typeof sortStates) => {
    setSortStates(prev => {
      const newStates = { ...prev };

      if (newStates[columnId].active) {
        // Toggle direction if already active
        newStates[columnId] = {
          ...newStates[columnId],
          direction: newStates[columnId].direction === "asc" ? "desc" : "asc",
        };
      } else {
        // Activate column and assign next priority
        const maxPriority = Math.max(...Object.values(newStates).map(s => s.priority || 0));
        newStates[columnId] = {
          active: true,
          direction: "asc",
          priority: maxPriority + 1,
        };
      }

      return newStates;
    });

    console.log(\`Clicked: \${columnId}\`);
  };

  return (
    <RgoLabelBox label="Multi-Column Sort with Priorities">
      <Table>
        <TableHead>
          <TableRow>
            <RgoTableCellSortable
              id="primary"
              direction={sortStates.primary.direction}
              active={sortStates.primary.active}
              onClick={() => handleColumnClick("primary")}
              priority={sortStates.primary.priority}
              HeaderComponent={() => (
                <Typography variant="body2" fontWeight={600}>
                  Name
                </Typography>
              )}
            />
            <RgoTableCellSortable
              id="secondary"
              direction={sortStates.secondary.direction}
              active={sortStates.secondary.active}
              onClick={() => handleColumnClick("secondary")}
              align="center"
              priority={sortStates.secondary.priority}
              HeaderComponent={() => (
                <Box display="flex" alignItems="center" gap={1}>
                  <DateRange fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>
                    Date Created
                  </Typography>
                </Box>
              )}
            />
            <RgoTableCellSortable
              id="tertiary"
              direction={sortStates.tertiary.direction}
              active={sortStates.tertiary.active}
              onClick={() => handleColumnClick("tertiary")}
              align="right"
              priority={sortStates.tertiary.priority}
              HeaderComponent={() => (
                <Typography variant="body2" fontWeight={600}>
                  Status
                </Typography>
              )}
            />
          </TableRow>
        </TableHead>
      </Table>
    </RgoLabelBox>
  );
}`;
