import { VireoInitializationBoundary } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";

export default function FailureAndRetryExample() {
  const [attempt, setAttempt] = React.useState(0);
  const initialize = React.useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (attempt === 0) throw new Error("The workspace configuration could not be loaded.");
  }, [attempt]);

  return (
    <VireoStorybookProvider>
      <ErrorBoundary
        resetKeys={[attempt]}
        fallbackRender={({ error }) => (
          <Stack spacing={2} sx={{ maxWidth: 520 }}>
            <Alert severity="error">{error instanceof Error ? error.message : String(error)}</Alert>
            <Button onClick={() => setAttempt(value => value + 1)}>Retry initialization</Button>
          </Stack>
        )}
      >
        <VireoInitializationBoundary initialize={initialize} fallback={<CircularProgress aria-label="Initializing" />}>
          <Alert severity="success">Initialization succeeded.</Alert>
        </VireoInitializationBoundary>
      </ErrorBoundary>
    </VireoStorybookProvider>
  );
}
