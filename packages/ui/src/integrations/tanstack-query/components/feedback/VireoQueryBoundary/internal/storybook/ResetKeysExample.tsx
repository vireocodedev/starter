import { VireoQueryBoundary } from "@vireocodedev/ui/tanstack-query";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Button, Stack, Typography } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

function RouteContent({ route }: { route: string }) {
  if (route === "customers") throw new Error("The customers route failed");
  return <Typography variant="h6">Reports route loaded</Typography>;
}

export default function ResetKeysExample() {
  const [route, setRoute] = React.useState("customers");
  const [client] = React.useState(() => new QueryClient());
  return (
    <VireoStorybookProvider>
      <QueryClientProvider client={client}>
        <Stack spacing={2}>
          <Button variant="outlined" onClick={() => setRoute("reports")}>
            Change reset key
          </Button>
          <VireoQueryBoundary resetKeys={[route]} retryable={false}>
            <RouteContent route={route} />
          </VireoQueryBoundary>
        </Stack>
      </QueryClientProvider>
    </VireoStorybookProvider>
  );
}
