import { Box } from "@mui/material";
import type React from "react";

export type TableHeaderLabelProps = {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
};

/**
 * Wraps a table column header label so long labels can wrap onto a second
 * line instead of being force-widened or clipped.
 *
 * `@vireocodedev/starter-ui`'s `RgoTableCellSortable` renders `HeaderComponent` as a direct child of nested
 * `display: flex` boxes. Flex items default to `min-width: auto`, which prevents their content
 * from wrapping and instead forces the flex item (and therefore the whole column) to grow to fit
 * the label on one line — silently pushing the rendered column wider than its configured
 * `widthPxMin` and contributing to horizontal overflow. Setting `minWidth: 0` here overrides that
 * default so the label can wrap within the column's actual width.
 */
export function TableHeaderLabel({ children, align = "left" }: TableHeaderLabelProps): React.JSX.Element {
  return (
    <Box
      component="span"
      sx={{
        minWidth: 0,
        whiteSpace: "normal",
        wordBreak: "break-word",
        lineHeight: 1.2,
        textAlign: align,
      }}
    >
      {children}
    </Box>
  );
}
