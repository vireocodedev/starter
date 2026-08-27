import { VireoInitializationBoundary } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import React from "react";

export default function DefaultExample() {
  const [generation, setGeneration] = React.useState(0);
  const initialize = React.useCallback(async () => {
    void generation;
    await new Promise(resolve => setTimeout(resolve, 700));
  }, [generation]);

  return (
    <VireoStorybookProvider>
      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <Button onClick={() => setGeneration(value => value + 1)}>Restart initialization</Button>
        <VireoInitializationBoundary
          initialize={initialize}
          fallback={
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
              }}
            >
              <CircularProgress aria-hidden size={20} />
              <Typography>Preparing customer workspace…</Typography>
            </Stack>
          }
        >
          <Typography color="success.main">Workspace generation {generation + 1} is ready.</Typography>
        </VireoInitializationBoundary>
      </Stack>
    </VireoStorybookProvider>
  );
}
