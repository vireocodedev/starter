import { Box, type BoxProps } from "@mui/material";
import { type ReactNode, type Ref } from "react";

export type MobileTableViewportProps = {
  children: ReactNode;
  viewportRef?: Ref<HTMLDivElement>;
  sx?: BoxProps["sx"];
};

export function MobileTableViewport({ children, viewportRef, sx }: MobileTableViewportProps) {
  return (
    <Box
      ref={viewportRef}
      data-mobile-table-viewport
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
