import { VireoOverlayHeader } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Box, Chip } from "@mui/material";

export default function LongTitleExample() {
  return (
    <VireoStorybookProvider>
      <Box sx={{ width: "100%", border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <VireoOverlayHeader
          title="Edit invoice INV-2026-000184 for a customer whose company name is deliberately long enough to wrap"
          actions={<Chip label="Unsaved changes" size="small" color="warning" />}
          closeLabel="Close invoice editor"
          onClose={() => {}}
        />
        <Box sx={{ minHeight: 160, p: 3, color: "text.secondary" }}>Overlay content starts here.</Box>
      </Box>
    </VireoStorybookProvider>
  );
}
