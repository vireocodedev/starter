import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoTableCellSortable } from "@/components/data-display/RgoTable/components/RgoTableCellSortable/RgoTableCellSortable";
import { DateRange } from "@mui/icons-material";
import { Box, Table, TableHead, TableRow, Typography } from "@mui/material";
import React from "react";

export function RgoTableCellSortableWithAlignmentsDemo() {
  const [leftState, setLeftState] = React.useState({ active: false, direction: "asc" as "asc" | "desc" });
  const [centerState, setCenterState] = React.useState({
    active: true,
    direction: "desc" as "asc" | "desc",
    priority: 1,
  });
  const [rightState, setRightState] = React.useState({ active: false, direction: "asc" as "asc" | "desc" });

  const handleLeftClick = (id: string) => {
    if (leftState.active) {
      setLeftState(prev => ({ ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }));
    } else {
      setLeftState({ active: true, direction: "asc" });
    }
    console.log(`Clicked: ${id}`);
  };

  const handleCenterClick = (id: string) => {
    if (centerState.active) {
      setCenterState(prev => ({ ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }));
    } else {
      setCenterState({ active: true, direction: "asc", priority: 1 });
    }
    console.log(`Clicked: ${id}`);
  };

  const handleRightClick = (id: string) => {
    if (rightState.active) {
      setRightState(prev => ({ ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }));
    } else {
      setRightState({ active: true, direction: "asc" });
    }
    console.log(`Clicked: ${id}`);
  };

  return (
    <RgoLabelBox label="Different Column Alignments">
      <Table>
        <TableHead>
          <TableRow>
            <RgoTableCellSortable
              id="left"
              direction={leftState.direction}
              active={leftState.active}
              onClick={handleLeftClick}
              align="left"
              widthPctShare={33.33}
              widthPxMin={150}
              HeaderComponent={() => (
                <Typography variant="body2" fontWeight={600}>
                  Name
                </Typography>
              )}
            />
            <RgoTableCellSortable
              id="center"
              direction={rightState.direction}
              active={rightState.active}
              onClick={handleRightClick}
              align="center"
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
              id="right"
              direction={centerState.direction}
              active={centerState.active}
              onClick={handleCenterClick}
              align="right"
              widthPctShare={33.33}
              widthPxMin={150}
              priority={centerState.priority}
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

export const RgoTableCellSortableWithAlignmentsDemoCode = `
import { RgoLabelBox, RgoTableCellSortable } from "@vireocodedev/starter-ui";
import { DateRange } from "@mui/icons-material";
import { Box, Table, TableHead, TableRow, Typography } from "@mui/material";
import React from "react";

export function RgoTableCellSortableWithAlignmentsDemo() {
  const [leftState, setLeftState] = React.useState({ active: false, direction: "asc" as "asc" | "desc" });
  const [centerState, setCenterState] = React.useState({
    active: true,
    direction: "desc" as "asc" | "desc",
    priority: 1,
  });
  const [rightState, setRightState] = React.useState({ active: false, direction: "asc" as "asc" | "desc" });

  const handleLeftClick = (id: string) => {
    if (leftState.active) {
      setLeftState(prev => ({ ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }));
    } else {
      setLeftState({ active: true, direction: "asc" });
    }
    console.log(\`Clicked: \${id}\`);
  };

  const handleCenterClick = (id: string) => {
    if (centerState.active) {
      setCenterState(prev => ({ ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }));
    } else {
      setCenterState({ active: true, direction: "asc", priority: 1 });
    }
    console.log(\`Clicked: \${id}\`);
  };

  const handleRightClick = (id: string) => {
    if (rightState.active) {
      setRightState(prev => ({ ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }));
    } else {
      setRightState({ active: true, direction: "asc" });
    }
    console.log(\`Clicked: \${id}\`);
  };

  return (
    <RgoLabelBox label="Different Column Alignments">
      <Table>
        <TableHead>
          <TableRow>
            <RgoTableCellSortable
              id="left"
              direction={leftState.direction}
              active={leftState.active}
              onClick={handleLeftClick}
              align="left"
              HeaderComponent={() => (
                <Typography variant="body2" fontWeight={600}>
                  Name
                </Typography>
              )}
            />
            <RgoTableCellSortable
              id="center"
              direction={rightState.direction}
              active={rightState.active}
              onClick={handleRightClick}
              align="center"
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
              id="right"
              direction={centerState.direction}
              active={centerState.active}
              onClick={handleCenterClick}
              align="right"
              priority={centerState.priority}
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
