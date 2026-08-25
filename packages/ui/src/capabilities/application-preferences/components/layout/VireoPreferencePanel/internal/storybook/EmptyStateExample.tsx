import { SearchOffRounded } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { VireoPreferencePanel } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function EmptyStateExample() {
  return (
    <VireoStorybookProvider>
      <VireoPreferencePanel
        sections={[]}
        emptyState={
          <Stack spacing={1} sx={{ alignItems: "center" }}>
            <SearchOffRounded color="disabled" />
            <Typography color="text.secondary">No preferences match this search.</Typography>
          </Stack>
        }
      />
    </VireoStorybookProvider>
  );
}
