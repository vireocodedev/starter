import { Paper, Typography } from "@mui/material";
import { VireoLoadingRegion } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoLoadingRegion loading={false} loadingLabel="Loading workspace summary">
        <Paper variant="outlined" sx={{ maxWidth: 420, p: 2 }}>
          <Typography variant="h6">Workspace summary</Typography>
          <Typography color="text.secondary">12 active projects · updated just now</Typography>
        </Paper>
      </VireoLoadingRegion>
    </VireoStorybookProvider>
  );
}
