import { useVireoOnlineStatus } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Alert, Stack, Typography } from "@mui/material";

export default function DefaultExample() {
  const isOnline = useVireoOnlineStatus();

  return (
    <VireoStorybookProvider>
      <Stack spacing={2} width="100%" maxWidth={560}>
        <Alert severity={isOnline ? "success" : "warning"}>
          {isOnline ? "Browser is online" : "Browser is offline"}
        </Alert>
        <Typography color="text.secondary">
          Toggle the browser network connection to observe this status update without polling.
        </Typography>
      </Stack>
    </VireoStorybookProvider>
  );
}
