import { VireoStatusDot } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Stack, Typography } from "@mui/material";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
        }}
      >
        <VireoStatusDot color="success" />
        <Typography>Service operational</Typography>
      </Stack>
    </VireoStorybookProvider>
  );
}
