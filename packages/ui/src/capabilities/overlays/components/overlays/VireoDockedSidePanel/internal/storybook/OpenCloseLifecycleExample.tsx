import { VireoDockedSidePanel, VireoOverlayHeader } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoDockedSidePanelWorkspaceFrame } from "@vireocodedev/starter-ui/storybook/VireoDockedSidePanel";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";

export default function OpenCloseLifecycleExample() {
  const [open, setOpen] = useState(true);

  return (
    <VireoStorybookProvider>
      <Stack spacing={2}>
        <Button variant="outlined" onClick={() => setOpen(true)} disabled={open} sx={{ alignSelf: "flex-start" }}>
          Open panel
        </Button>
        <VireoDockedSidePanelWorkspaceFrame>
          <VireoDockedSidePanel open={open} width={420} minWidth={280} maxWidth={620}>
            <VireoOverlayHeader
              title="Invoice details"
              closeLabel="Close invoice details"
              onClose={() => setOpen(false)}
            />
            <Box sx={{ p: 3 }}>
              <Typography color="text.secondary">
                Closing releases the reserved workspace width after the surface finishes leaving.
              </Typography>
            </Box>
          </VireoDockedSidePanel>
        </VireoDockedSidePanelWorkspaceFrame>
      </Stack>
    </VireoStorybookProvider>
  );
}
