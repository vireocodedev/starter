import { Box, Button, Stack, Typography } from "@mui/material";
import type React from "react";

export type VireoDockedSidePanelWorkspaceFrameProps = {
  children: React.ReactNode;
};

/** Neutral desktop workspace used by VireoDockedSidePanel executable examples. */
export function VireoDockedSidePanelWorkspaceFrame({ children }: VireoDockedSidePanelWorkspaceFrameProps) {
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        minWidth: 720,
        height: 440,
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.default",
      }}
    >
      <Box component="main" sx={{ flex: 1, minWidth: 0, p: 3 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="overline" color="primary.main">
              Finance workspace
            </Typography>
            <Typography variant="h4">August overview</Typography>
          </Box>
          <Button variant="contained">New invoice</Button>
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          The docked panel reserves space beside this workspace instead of covering it.
        </Typography>
      </Box>
      {children}
    </Box>
  );
}
