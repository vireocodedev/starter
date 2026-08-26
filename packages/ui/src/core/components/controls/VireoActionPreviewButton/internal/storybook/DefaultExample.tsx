import { DeleteOutlined } from "@mui/icons-material";
import { VireoActionPreviewButton } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

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
