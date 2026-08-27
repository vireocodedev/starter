import { VireoOverlayHeader } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Box } from "@mui/material";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <Box sx={{ width: "100%", border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <VireoOverlayHeader title="Edit invoice" />
        <Box sx={{ minHeight: 160, p: 3, color: "text.secondary" }}>Overlay content starts here.</Box>
      </Box>
    </VireoStorybookProvider>
  );
}
