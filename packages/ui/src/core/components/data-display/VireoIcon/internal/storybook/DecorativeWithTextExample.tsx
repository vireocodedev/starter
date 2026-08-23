import { Stack, Typography } from "@mui/material";
import { VireoIcon, VireoIconRegistryProvider } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function DecorativeWithTextExample() {
  return (
    <VireoStorybookProvider>
      <VireoIconRegistryProvider>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
          }}
        >
          <VireoIcon icon="check-circle" color="success" aria-hidden />
          <Typography>Completed successfully</Typography>
        </Stack>
      </VireoIconRegistryProvider>
    </VireoStorybookProvider>
  );
}
