import { CardActions } from "@mui/material";
import { type ComponentProps } from "react";

export function AppCardActions({ children, sx, ...props }: ComponentProps<typeof CardActions>) {
  const baseSx = {
    justifyContent: "flex-end",
    p: "1rem 1.5rem",
    borderTop: "1px solid var(--mui-palette-grey-300)",
  };
  const mergedSx = sx ? (Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx]) : baseSx;

  return (
    <CardActions {...props} sx={mergedSx}>
      {children}
    </CardActions>
  );
}
