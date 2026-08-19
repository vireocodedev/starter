import { VireoOverlayHeader } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box } from "@mui/material";

export default function DisabledCloseExample() {
  return (
    <VireoStorybookProvider>
      <Box sx={{ width: "100%", border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <VireoOverlayHeader title="Edit invoice" closeDisabled closeLabel="Close while saving" onClose={() => {}} />
        <Box sx={{ minHeight: 160, p: 3, color: "text.secondary" }}>Overlay content starts here.</Box>
      </Box>
    </VireoStorybookProvider>
  );
}
