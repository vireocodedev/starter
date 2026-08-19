import { VireoDockedSidePanel, VireoOverlayHeader } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoDockedSidePanelWorkspaceFrame } from "@vireocodedev/starter-ui/storybook/VireoDockedSidePanel";
import { Box, Typography } from "@mui/material";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoDockedSidePanelWorkspaceFrame>
        <VireoDockedSidePanel
          open
          width={420}
          minWidth={280}
          maxWidth={620}
          slots={{ root: "section", surface: "section" }}
          slotProps={{
            root: ownerState => ({ "data-panel-open": String(ownerState.open) }),
            surface: {
              "aria-label": "Customized invoice details",
              sx: { borderLeftStyle: "dashed", borderLeftWidth: 3 },
            },
          }}
        >
          <VireoOverlayHeader title="Invoice details" />
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">The root and visible surface render as semantic sections.</Typography>
          </Box>
        </VireoDockedSidePanel>
      </VireoDockedSidePanelWorkspaceFrame>
    </VireoStorybookProvider>
  );
}
