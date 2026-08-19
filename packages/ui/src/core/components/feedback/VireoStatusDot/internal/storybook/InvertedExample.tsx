import { VireoStatusDot } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Chip, Stack } from "@mui/material";

export default function InvertedExample() {
  return (
    <VireoStorybookProvider>
      <Stack direction="row" spacing={1}>
        <Chip
          color="primary"
          label="Selected environment"
          icon={<VireoStatusDot color="success" selected sx={{ ml: 1 }} />}
        />
        <Chip
          color="secondary"
          label="Selected deployment"
          icon={<VireoStatusDot color="warning" selected sx={{ ml: 1 }} />}
        />
      </Stack>
    </VireoStorybookProvider>
  );
}
