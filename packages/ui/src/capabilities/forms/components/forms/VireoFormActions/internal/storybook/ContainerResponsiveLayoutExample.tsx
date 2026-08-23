import { Box, Button, Stack, Typography } from "@mui/material";
import { VireoFormActions } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function ActionsAtWidth({ label, width }: { label: string; width: number }) {
  return (
    <Box sx={{ maxWidth: width, width: "100%" }}>
      <Typography
        color="text.secondary"
        variant="body2"
        sx={{
          mb: 1,
        }}
      >
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
      <Stack
        spacing={3}
        sx={{
          alignItems: "flex-start",
        }}
      >
        <ActionsAtWidth label="Wide container" width={640} />
        <ActionsAtWidth label="Compact container" width={320} />
      </Stack>
    </VireoStorybookProvider>
  );
}
