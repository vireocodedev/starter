import { VireoDelayedRender } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { CircularProgress, Stack, Typography } from "@mui/material";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoDelayedRender>
        <Stack
          direction="row"
          spacing={1.5}
          role="status"
          sx={{
            alignItems: "center",
          }}
        >
          <CircularProgress size={20} />
          <Typography>Loading report…</Typography>
        </Stack>
      </VireoDelayedRender>
    </VireoStorybookProvider>
  );
}
