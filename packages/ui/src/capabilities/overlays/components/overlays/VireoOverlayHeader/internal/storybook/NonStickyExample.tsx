import { VireoOverlayHeader } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box } from "@mui/material";

export default function NonStickyExample() {
  return (
    <VireoStorybookProvider>
      <Box
        sx={{
          width: "100%",
          height: 160,
          overflowY: "auto",
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <VireoOverlayHeader title="Edit invoice" sticky={false} />
        <Box sx={{ minHeight: 320, p: 3, color: "text.secondary" }}>Scroll this overlay content.</Box>
      </Box>
    </VireoStorybookProvider>
  );
}
