import { VireoSidePanelResizeHandle, type VireoSidePanelResizeHandleProps } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box } from "@mui/material";

export default function PointerInteractionsExample({
  onResizeDoubleClick,
  onResizeStart,
}: Pick<VireoSidePanelResizeHandleProps, "onResizeDoubleClick" | "onResizeStart">) {
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
        <VireoSidePanelResizeHandle onResizeStart={onResizeStart} onResizeDoubleClick={onResizeDoubleClick} />
        <Box sx={{ p: 3, color: "text.secondary" }}>Side-panel content</Box>
      </Box>
    </VireoStorybookProvider>
  );
}
