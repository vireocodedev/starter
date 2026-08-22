import { VireoDelayedRender } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { CircularProgress, Stack, Typography } from "@mui/material";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoDelayedRender>
        <Stack direction="row" spacing={1.5} alignItems="center" role="status">
          <CircularProgress size={20} />
          <Typography>Loading report…</Typography>
        </Stack>
      </VireoDelayedRender>
    </VireoStorybookProvider>
  );
}
