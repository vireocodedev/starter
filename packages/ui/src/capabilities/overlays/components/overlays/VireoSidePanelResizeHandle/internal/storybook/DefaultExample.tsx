import { VireoSidePanelResizeHandle } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Box } from "@mui/material";

export default function DefaultExample() {
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
        <VireoSidePanelResizeHandle onResizeStart={() => undefined} onResizeDoubleClick={() => undefined} />
        <Box sx={{ p: 3, color: "text.secondary" }}>Side-panel content</Box>
      </Box>
    </VireoStorybookProvider>
  );
}
