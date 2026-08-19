import { VireoStatusDot } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Stack, Typography } from "@mui/material";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <Stack direction="row" spacing={1} alignItems="center">
        <VireoStatusDot color="success" />
        <Typography>Service operational</Typography>
      </Stack>
    </VireoStorybookProvider>
  );
}
