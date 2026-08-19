import { VireoSidePanelResizeHandle } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box } from "@mui/material";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <Box
        sx={{
          position: "relative",
          width: 360,
          height: 240,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <VireoSidePanelResizeHandle
          onResizeStart={() => undefined}
          onResizeDoubleClick={() => undefined}
          slots={{ root: "section" }}
          slotProps={{
            root: ownerState => ({
              "data-resizing": String(ownerState.isResizing),
              sx: { width: 20, "&::after": { width: 10 } },
            }),
          }}
        />
        <Box sx={{ p: 3, color: "text.secondary" }}>Side-panel content</Box>
      </Box>
    </VireoStorybookProvider>
  );
}
