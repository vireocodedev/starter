import type { DtBaseColumnAlign, DtSortDirection } from "@/components/data-display/RgoTable";
import { Box, type SxProps, TableCell, TableSortLabel } from "@mui/material";
import React from "react";
import "./RgoTableCellSortable.css";

export type RgoTableCellSortableProps = {
  id: string;
  HeaderComponent: React.ComponentType;
  direction: DtSortDirection;
  active: boolean;
  onClick: (id: string) => void;
  align?: DtBaseColumnAlign;
  priority?: number;
  widthPctShare: number;
  widthPxMin: number;
  colSpan?: number;
  sx?: SxProps;
};

export function RgoTableCellSortable({
  id,
  align = "left",
  HeaderComponent,
  priority,
  direction,
  active,
  onClick,
  widthPctShare,
  widthPxMin,
  colSpan,
  sx,
}: RgoTableCellSortableProps) {
  const [hovered, setHovered] = React.useState(false);
  const onMouseEnter = React.useCallback(() => setHovered(true), []);
  const onMouseLeave = React.useCallback(() => setHovered(false), []);
  const justifyContent = align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start";
  const flexDirection = align === "right" ? "row-reverse" : "row";
  const activeComputed = hovered || active;
  const priorityComputed = typeof priority !== "number" || priority <= 0 ? undefined : priority;

  const onSortLabelClick = React.useCallback(() => {
    onClick(id);
  }, [id, onClick]);

  return (
    <TableCell
      sx={{ width: `${widthPctShare}%`, minWidth: `${widthPxMin}px`, ...(sx ?? {}) }}
      colSpan={colSpan}
      data-column={id}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Box display="flex" justifyContent={justifyContent}>
        <Box display="flex" gap={1} flexDirection={flexDirection}>
          <HeaderComponent />
          <TableSortLabel onClick={onSortLabelClick} active={activeComputed} direction={direction}>
            {priorityComputed}
          </TableSortLabel>
        </Box>
      </Box>
    </TableCell>
  );
}
