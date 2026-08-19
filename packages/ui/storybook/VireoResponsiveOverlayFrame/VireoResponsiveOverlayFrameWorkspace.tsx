import { Box, Button, Stack, Typography } from "@mui/material";
import type React from "react";

export type VireoResponsiveOverlayFrameWorkspaceProps = {
  children: React.ReactNode;
  onOpen: () => void;
};

/** Neutral workspace used by VireoResponsiveOverlayFrame executable examples. */
export function VireoResponsiveOverlayFrameWorkspace({ children, onOpen }: VireoResponsiveOverlayFrameWorkspaceProps) {
  return (
    <Box sx={{ display: "flex", width: "100%", minWidth: { xs: 0, md: 720 }, height: 520, overflow: "hidden" }}>
      <Box component="main" sx={{ flex: 1, minWidth: 0, p: 3, bgcolor: "background.default" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="overline" color="primary.main">
              Operations
            </Typography>
            <Typography variant="h4">Customer accounts</Typography>
          </Box>
          <Button variant="contained" onClick={onOpen}>
            View customer details
          </Button>
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          Open the same customer flow on a mobile or desktop viewport to see the selected responsive surface.
        </Typography>
      </Box>
      {children}
    </Box>
  );
}
