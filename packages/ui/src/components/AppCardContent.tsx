import { CardContent } from "@mui/material";
import { type ComponentProps } from "react";

export function AppCardContent({ children, sx, ...props }: ComponentProps<typeof CardContent>) {
  const baseSx = { backgroundColor: "grey.50" };
  const mergedSx = sx ? (Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx]) : baseSx;

  return (
    <CardContent {...props} sx={mergedSx}>
      {children}
    </CardContent>
  );
}
