import { useVireoTransitionPresence } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Fade, Paper, Stack, Typography } from "@mui/material";
import React from "react";

export default function InterruptedExitExample() {
  const [account, setAccount] = React.useState<string | null>("Northstar Analytics");
  const { completeExit, renderedValue, visible } = useVireoTransitionPresence(account);

  return (
    <VireoStorybookProvider>
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => setAccount("Northstar Analytics")}>
            Northstar
          </Button>
          <Button variant="contained" onClick={() => setAccount("Atlas Workspace")}>
            Atlas
          </Button>
          <Button onClick={() => setAccount(null)}>Hide</Button>
        </Stack>
        <Fade in={visible} onExited={completeExit} timeout={800}>
          <Paper sx={{ p: 2 }}>
            <Typography fontWeight={700}>{renderedValue ?? "No account"}</Typography>
            <Typography color="text.secondary">
              Select either account during the slower exit to reverse it without clearing the new value.
            </Typography>
          </Paper>
        </Fade>
      </Stack>
    </VireoStorybookProvider>
  );
}
