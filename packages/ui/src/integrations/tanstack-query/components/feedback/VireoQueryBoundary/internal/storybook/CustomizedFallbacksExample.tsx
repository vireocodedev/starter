import { VireoQueryBoundary } from "@vireocodedev/starter-ui/tanstack-query";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Alert, AlertTitle } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

function FailedContent(): never {
  throw new Error("Export service unavailable");
}

export default function CustomizedFallbacksExample() {
  const [client] = React.useState(() => new QueryClient());
  return (
    <VireoStorybookProvider>
      <QueryClientProvider client={client}>
        <VireoQueryBoundary
          retryable={false}
          errorFallback={({ error, retryable }) => (
            <Alert severity="warning">
              <AlertTitle>Export paused</AlertTitle>
              {(error as Error).message}; retryable: {String(retryable)}
            </Alert>
          )}
        >
          <FailedContent />
        </VireoQueryBoundary>
      </QueryClientProvider>
    </VireoStorybookProvider>
  );
}
