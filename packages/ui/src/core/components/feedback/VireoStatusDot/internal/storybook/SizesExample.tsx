import { VireoStatusDot } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Stack, Typography } from "@mui/material";

export default function SizesExample() {
  return (
    <VireoStorybookProvider>
      <Stack direction="row" spacing={3} alignItems="center">
        {[6, 8, 12, 16].map(size => (
          <Stack key={size} spacing={1} alignItems="center">
            <VireoStatusDot color="info" size={size} />
            <Typography variant="caption">{size}px</Typography>
          </Stack>
        ))}
      </Stack>
    </VireoStorybookProvider>
  );
}
