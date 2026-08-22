import { Box, Button, Stack, Typography } from "@mui/material";
import { VireoFormActions } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function ActionsAtWidth({ label, width }: { label: string; width: number }) {
  return (
    <Box sx={{ maxWidth: width, width: "100%" }}>
      <Typography color="text.secondary" mb={1} variant="body2">
        {label}
      </Typography>
      <VireoFormActions>
        <Button variant="outlined">Discard changes</Button>
        <Button variant="contained">Save customer</Button>
      </VireoFormActions>
    </Box>
  );
}

export default function ContainerResponsiveLayoutExample() {
  return (
    <VireoStorybookProvider>
      <Stack alignItems="flex-start" spacing={3}>
        <ActionsAtWidth label="Wide container" width={640} />
        <ActionsAtWidth label="Compact container" width={320} />
      </Stack>
    </VireoStorybookProvider>
  );
}
