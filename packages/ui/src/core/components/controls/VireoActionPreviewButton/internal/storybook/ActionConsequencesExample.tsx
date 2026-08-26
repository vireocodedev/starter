import { ArchiveOutlined, FilterAltOutlined, SaveOutlined } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { VireoActionPreviewButton } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function ActionConsequencesExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={1.5} sx={{ width: 360 }}>
        <VireoActionPreviewButton
          label="Save changes"
          preview="Commits 3 modified records"
          startIcon={<SaveOutlined />}
          variant="contained"
        />
        <VireoActionPreviewButton
          label="Apply filters"
          preview="Shows 128 matching records"
          startIcon={<FilterAltOutlined />}
          variant="outlined"
        />
        <VireoActionPreviewButton
          color="warning"
          label="Archive project"
          preview="Hides it from active work; restoration stays available"
          startIcon={<ArchiveOutlined />}
          variant="outlined"
        />
      </Stack>
    </VireoStorybookProvider>
  );
}
