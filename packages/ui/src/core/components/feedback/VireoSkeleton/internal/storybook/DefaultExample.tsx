import { Avatar, Stack, Typography } from "@mui/material";
import { VireoSkeleton } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center", width: 320 }}>
        <VireoSkeleton variant="circular">
          <Avatar />
        </VireoSkeleton>
        <Stack sx={{ flex: 1 }}>
          <VireoSkeleton>
            <Typography variant="subtitle1">Workspace owner</Typography>
          </VireoSkeleton>
          <VireoSkeleton>
            <Typography variant="body2">owner@example.com</Typography>
          </VireoSkeleton>
        </Stack>
      </Stack>
    </VireoStorybookProvider>
  );
}
