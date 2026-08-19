import { Stack, Typography } from "@mui/material";
import { VireoIcon, VireoIconRegistryProvider } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoIconRegistryProvider>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ color: "success.light" }}>
          <VireoIcon icon="check-circle" titleAccess="Completed" />
          <Typography color="text.primary">Completed successfully</Typography>
        </Stack>
      </VireoIconRegistryProvider>
    </VireoStorybookProvider>
  );
}
