import { PublishOutlined } from "@mui/icons-material";
import { Box } from "@mui/material";
import { VireoActionPreviewButton } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function NarrowLayoutExample() {
  return (
    <VireoStorybookProvider>
      <Box sx={{ width: 240 }}>
        <VireoActionPreviewButton
          fullWidth
          label="Publish workspace"
          preview="Makes this version available to 24 collaborators"
          startIcon={<PublishOutlined />}
          variant="contained"
        />
      </Box>
    </VireoStorybookProvider>
  );
}
