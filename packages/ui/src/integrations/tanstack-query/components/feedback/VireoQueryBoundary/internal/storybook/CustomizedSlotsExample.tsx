import { VireoQueryBoundary } from "@vireocodedev/ui/tanstack-query";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Alert, Button, Paper, Stack } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

function FailedContent(): never {
  throw new Error("Instrumented failure");
}

export default function CustomizedSlotsExample() {
  const [client] = React.useState(() => new QueryClient());
  return (
    <VireoStorybookProvider>
      <QueryClientProvider client={client}>
        <VireoQueryBoundary
          slots={{ root: Paper, errorAlert: Alert, actions: Stack, retryButton: Button }}
          slotProps={{
            root: ownerState => ({
              elevation: 3,
              "data-status": ownerState.status,
              sx: { bgcolor: "background.paper" },
            }),
            errorAlert: { variant: "outlined" },
            retryButton: { variant: "contained" },
          }}
          errorTitle="Customized query boundary"
        >
          <FailedContent />
        </VireoQueryBoundary>
      </QueryClientProvider>
    </VireoStorybookProvider>
  );
}
