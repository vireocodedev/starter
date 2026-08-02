import {
  RgoTableCellSortable,
  type RgoTableCellSortableProps,
} from "@/components/data-display/RgoTable/components/RgoTableCellSortable/RgoTableCellSortable";
import { Table, TableHead, TableRow } from "@mui/material";
import React from "react";

export function RgoTableCellSortableWithDefaultsDemo(
  props: Omit<RgoTableCellSortableProps, "direction" | "active" | "onClick">,
) {
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
  const [isActive, setIsActive] = React.useState(false);

  const handleClick = (id: string) => {
    if (isActive) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setIsActive(true);
    }
    console.log(`Clicked sort for column: ${id}, direction: ${sortDirection}`);
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <RgoTableCellSortable {...props} direction={sortDirection} active={isActive} onClick={handleClick} />
        </TableRow>
      </TableHead>
    </Table>
  );
}

export const RgoTableCellSortableWithDefaultsDemoCode = `
import { RgoTableCellSortable, type RgoTableCellSortableProps } from "@vireocodedev/starter-ui";
import { Table, TableHead, TableRow } from "@mui/material";
import React from "react";

export function RgoTableCellSortableWithDefaultsDemo(
  props: Omit<RgoTableCellSortableProps, "direction" | "active" | "onClick">,
) {
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
  const [isActive, setIsActive] = React.useState(false);

  const handleClick = (id: string) => {
    if (isActive) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setIsActive(true);
    }
    console.log(\`Clicked sort for column: \${id}, direction: \${sortDirection}\`);
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <RgoTableCellSortable {...props} direction={sortDirection} active={isActive} onClick={handleClick} />
        </TableRow>
      </TableHead>
    </Table>
  );
}`;
