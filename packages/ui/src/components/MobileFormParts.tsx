import { Box } from "@mui/material";
import { type ReactNode } from "react";

export function MobileFormContent({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={theme => ({
        flex: "none",
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
        px: 1.5,
        pt: 1,
        pb: "max(1rem, env(safe-area-inset-bottom))",
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
