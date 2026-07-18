import { Box } from "@mui/material";
import { type ReactNode } from "react";

export function MobileFormContent({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={theme => ({
        flex: 1,
        minHeight: 0,
        overflow: "auto",
        // TODO: this padding should be configurable from the parent component, but for now we hardcode it to match the default padding of the desktop DialogContent
        p: "1rem",
        backgroundColor: theme.palette.grey[50],
      })}
    >
      {children}
    </Box>
  );
}

export function MobileFormActions({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        flexShrink: 0,
        display: "flex",
        justifyContent: "flex-end",
        gap: 1,
        p: "1rem 1.5rem",
        borderTop: "1px solid var(--mui-palette-grey-300)",
        backgroundColor: "background.paper",
      }}
    >
      {children}
    </Box>
  );
}

export function MobileFormActionsNone() {
  return null;
}
