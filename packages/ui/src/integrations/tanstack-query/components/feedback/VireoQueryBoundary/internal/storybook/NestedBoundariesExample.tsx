import { VireoQueryBoundary } from "@vireocodedev/ui/tanstack-query";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Paper, Stack, Typography } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

function FailedPanel(): never {
  throw new Error("Panel failed");
}

export default function NestedBoundariesExample() {
  const [client] = React.useState(() => new QueryClient());
  return (
    <VireoStorybookProvider>
      <QueryClientProvider client={client}>
        <VireoQueryBoundary>
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography>Outer workspace remains available.</Typography>
            </Paper>
            <VireoQueryBoundary retryable={false} errorTitle="Activity panel failed">
              <FailedPanel />
            </VireoQueryBoundary>
          </Stack>
        </VireoQueryBoundary>
      </QueryClientProvider>
    </VireoStorybookProvider>
  );
}
