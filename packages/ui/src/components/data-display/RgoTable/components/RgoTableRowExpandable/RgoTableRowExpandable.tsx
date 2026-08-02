import { calculateStickySx, type DtBaseColumn } from "@/components/data-display/RgoTable";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Box, Collapse, IconButton, TableCell, TableRow } from "@mui/material";
import React from "react";
import "./RgoTableRowExpandable.css";

export type RgoTableRowExpandableProps<T> = {
  item: T;
  columns: DtBaseColumn<T>[];
  AccordionComponent: React.ComponentType<{ element: T }>;
  highlighted?: (element: T) => boolean;
  disabled?: boolean;
  rowIndex?: number;
  tableSize?: "small" | "medium";
};

export function RgoTableRowExpandable<T>({
  item,
  columns,
  AccordionComponent,
  highlighted,
  disabled = false,
  rowIndex = -1,
  tableSize = "medium",
}: RgoTableRowExpandableProps<T>) {
  const [open, setOpen] = React.useState(false);
  const toggleOpen = React.useCallback(() => setOpen(prev => !prev), []);
  const CaretIcon = open ? KeyboardArrowUp : KeyboardArrowDown;
  const shouldAccordionBeSticky = columns.some(col => col.sticky === "left");
  const stickySx = shouldAccordionBeSticky
    ? {
        position: "sticky",
        left: 0,
        zIndex: 3,
        backgroundColor: "inherit",
      }
    : {};

  const minMaxWidthPx = tableSize === "medium" ? 52 : 46;
  const accordionButtonCellPadding = "6px";

  return (
    <>
      <TableRow className={highlighted?.(item) ? "highlighted" : ""} hover role="checkbox" tabIndex={-1}>
        <TableCell
          sx={{
            minWidth: `${minMaxWidthPx}px`,
            maxWidth: `${minMaxWidthPx}px`,
            width: "0%",
            padding: accordionButtonCellPadding,
            ...stickySx,
          }}
        >
          {!disabled && (
            <IconButton aria-label="expand row" size={tableSize === "medium" ? "medium" : "small"} onClick={toggleOpen}>
              <CaretIcon />
            </IconButton>
          )}
        </TableCell>
        {columns.map(({ id, align, BodyComponent }, colIndex) => (
          <TableCell key={id} align={align} sx={calculateStickySx(columns, colIndex, minMaxWidthPx, false, true)}>
            <BodyComponent element={item} index={rowIndex} />
          </TableCell>
        ))}
      </TableRow>

      {!disabled && (
        <TableRow data-accordion>
          <TableCell
            style={{ borderBottom: "none", paddingBlock: open ? undefined : 0, transition: "padding-block 250ms" }}
            colSpan={columns.length + 1}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <AccordionComponent element={item} />
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
