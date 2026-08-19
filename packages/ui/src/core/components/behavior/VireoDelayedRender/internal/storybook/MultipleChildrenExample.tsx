import { VireoDelayedRender } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Stack, Typography } from "@mui/material";

export default function MultipleChildrenExample({ delay }: { delay?: number }) {
  return (
    <VireoStorybookProvider>
      <VireoDelayedRender delay={delay}>
        <Stack gap={1}>
          <Typography fontWeight={700}>First layout participant</Typography>
          <Typography color="text.secondary">Second layout participant</Typography>
        </Stack>
      </VireoDelayedRender>
    </VireoStorybookProvider>
  );
}
