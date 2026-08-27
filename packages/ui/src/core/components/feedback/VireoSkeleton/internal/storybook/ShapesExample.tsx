import { Box, Stack, Typography } from "@mui/material";
import { VireoSkeleton } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function ShapesExample() {
  return (
    <VireoStorybookProvider>
      <Stack aria-label="Text, icon, and media placeholders" direction="row" spacing={3} sx={{ alignItems: "end" }}>
        <Stack spacing={1}>
          <Typography variant="caption">Text</Typography>
          <VireoSkeleton width={160} />
        </Stack>
        <Stack spacing={1}>
          <Typography variant="caption">Icon</Typography>
          <VireoSkeleton variant="circular" width={32} height={32} />
        </Stack>
        <Stack spacing={1}>
          <Typography variant="caption">Media</Typography>
          <VireoSkeleton variant="rounded">
            <Box sx={{ width: 180, aspectRatio: "16 / 9" }} />
          </VireoSkeleton>
        </Stack>
      </Stack>
    </VireoStorybookProvider>
  );
}
