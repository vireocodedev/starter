import { RgoLabelBox } from "@/core/public";
import { RgoTableCellSortable } from "@/components/data-display/RgoTable/components/RgoTableCellSortable/RgoTableCellSortable";
import { Sort, SortByAlpha } from "@mui/icons-material";
import { Box, Table, TableHead, TableRow, Typography } from "@mui/material";
import React from "react";

export function RgoTableCellSortableWithHeaderComponentDemo() {
  const IconHeaderComponent = () => (
    <Box display="flex" alignItems="center" gap={1}>
      <Sort fontSize="small" color="primary" />
      <Typography variant="body2" fontWeight={600} color="primary">
        Sortable
      </Typography>
    </Box>
  );

  const AlphaHeaderComponent = () => (
    <Box display="flex" alignItems="center" gap={1}>
      <SortByAlpha fontSize="small" />
      <Typography variant="body2" fontWeight={600}>
        Alphabetical
      </Typography>
    </Box>
  );

  const [iconState, setIconState] = React.useState({ active: true, direction: "asc" as "asc" | "desc", priority: 1 });
  const [alphaState, setAlphaState] = React.useState({ active: false, direction: "desc" as "asc" | "desc" });

  const handleIconClick = (id: string) => {
    if (iconState.active) {
      setIconState(prev => ({ ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }));
    } else {
      setIconState({ active: true, direction: "asc", priority: 1 });
    }
    console.log(`Clicked: ${id}`);
  };

  const handleAlphaClick = (id: string) => {
    if (alphaState.active) {
      setAlphaState(prev => ({ ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }));
    } else {
      setAlphaState({ active: true, direction: "asc" });
    }
    console.log(`Clicked: ${id}`);
  };

  return (
    <RgoLabelBox label="Custom Header Components">
      <Table>
        <TableHead>
          <TableRow>
            <RgoTableCellSortable
              id="icon-header"
              HeaderComponent={IconHeaderComponent}
              direction={iconState.direction}
              active={iconState.active}
              onClick={handleIconClick}
              priority={iconState.priority}
              widthPctShare={50}
              widthPxMin={150}
            />
            <RgoTableCellSortable
              id="alpha-header"
              HeaderComponent={AlphaHeaderComponent}
              direction={alphaState.direction}
              active={alphaState.active}
              onClick={handleAlphaClick}
              align="center"
              widthPctShare={50}
              widthPxMin={150}
            />
          </TableRow>
        </TableHead>
      </Table>
    </RgoLabelBox>
  );
}

export const RgoTableCellSortableWithHeaderComponentDemoCode = `
import { RgoLabelBox, RgoTableCellSortable } from "@vireocodedev/starter-ui";
import { Sort, SortByAlpha } from "@mui/icons-material";
import { Box, Table, TableHead, TableRow, Typography } from "@mui/material";
import React from "react";

export function RgoTableCellSortableWithHeaderComponentDemo() {
  const IconHeaderComponent = () => (
    <Box display="flex" alignItems="center" gap={1}>
      <Sort fontSize="small" color="primary" />
      <Typography variant="body2" fontWeight={600} color="primary">
        Sortable
      </Typography>
    </Box>
  );

  const AlphaHeaderComponent = () => (
    <Box display="flex" alignItems="center" gap={1}>
      <SortByAlpha fontSize="small" />
      <Typography variant="body2" fontWeight={600}>
        Alphabetical
      </Typography>
    </Box>
  );

  const [iconState, setIconState] = React.useState({ active: true, direction: "asc" as "asc" | "desc", priority: 1 });
  const [alphaState, setAlphaState] = React.useState({ active: false, direction: "desc" as "asc" | "desc" });

  const handleIconClick = (id: string) => {
    if (iconState.active) {
      setIconState(prev => ({ ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }));
    } else {
      setIconState({ active: true, direction: "asc", priority: 1 });
    }
    console.log(\`Clicked: \${id}\`);
  };

  const handleAlphaClick = (id: string) => {
    if (alphaState.active) {
      setAlphaState(prev => ({ ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }));
    } else {
      setAlphaState({ active: true, direction: "asc" });
    }
    console.log(\`Clicked: \${id}\`);
  };

  return (
    <RgoLabelBox label="Custom Header Components">
      <Table>
        <TableHead>
          <TableRow>
            <RgoTableCellSortable
              id="icon-header"
              HeaderComponent={IconHeaderComponent}
              direction={iconState.direction}
              active={iconState.active}
              onClick={handleIconClick}
              priority={iconState.priority}
            />
            <RgoTableCellSortable
              id="alpha-header"
              HeaderComponent={AlphaHeaderComponent}
              direction={alphaState.direction}
              active={alphaState.active}
              onClick={handleAlphaClick}
              align="center"
            />
          </TableRow>
        </TableHead>
      </Table>
    </RgoLabelBox>
  );
}`;
