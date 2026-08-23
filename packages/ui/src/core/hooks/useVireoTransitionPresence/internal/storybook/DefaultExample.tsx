import { useVireoTransitionPresence } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Fade, Paper, Stack, Typography } from "@mui/material";
import React from "react";

export default function DefaultExample() {
  const [account, setAccount] = React.useState<string | null>("Northstar Analytics");
  const { completeExit, dismiss, renderedValue, visible } = useVireoTransitionPresence(account);

  return (
    <VireoStorybookProvider>
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => setAccount("Northstar Analytics")}>
            Show account
          </Button>
          <Button onClick={dismiss}>Dismiss</Button>
        </Stack>
        <Fade in={visible} onExited={completeExit} timeout={300}>
          <Paper sx={{ p: 2 }}>
            <Typography
              sx={{
                fontWeight: 700,
              }}
            >
              {renderedValue ?? "No account"}
            </Typography>
            <Typography color="text.secondary">Retained until the fade exit completes.</Typography>
          </Paper>
        </Fade>
      </Stack>
    </VireoStorybookProvider>
  );
}
