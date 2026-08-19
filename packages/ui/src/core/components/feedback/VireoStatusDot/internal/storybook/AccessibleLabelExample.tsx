import { VireoStatusDot } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Stack, Typography } from "@mui/material";

export default function AccessibleLabelExample() {
  return (
    <VireoStorybookProvider>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <VireoStatusDot color="error" label="System unavailable" size={12} />
        <Typography color="text.secondary">
          This standalone marker exposes its meaning through an accessible label.
        </Typography>
      </Stack>
    </VireoStorybookProvider>
  );
}
