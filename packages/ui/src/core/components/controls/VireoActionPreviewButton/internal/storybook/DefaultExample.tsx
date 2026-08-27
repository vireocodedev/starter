import { DeleteOutlined } from "@mui/icons-material";
import { VireoActionPreviewButton } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoActionPreviewButton
        color="error"
        label="Delete invoice"
        preview="Removes invoice #1247 permanently"
        startIcon={<DeleteOutlined />}
        variant="contained"
      />
    </VireoStorybookProvider>
  );
}
