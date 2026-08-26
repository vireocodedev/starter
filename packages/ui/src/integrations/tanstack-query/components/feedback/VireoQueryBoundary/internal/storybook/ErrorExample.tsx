import { VireoQueryBoundary } from "@vireocodedev/starter-ui/tanstack-query";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Alert, Typography } from "@mui/material";
import { QueryClient, QueryClientProvider, useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

export default function ErrorExample() {
  const attempts = React.useRef(0);
  const [client] = React.useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  return (
    <VireoStorybookProvider>
      <QueryClientProvider client={client}>
        <VireoQueryBoundary
          errorTitle="Customer activity unavailable"
          errorMessage="Retry the local request to recover."
        >
          <RecoveringQuery attempts={attempts} />
        </VireoQueryBoundary>
      </QueryClientProvider>
    </VireoStorybookProvider>
  );
}

function RecoveringQuery({ attempts }: { attempts: React.MutableRefObject<number> }) {
  const { data } = useSuspenseQuery({
    queryKey: ["recovering-query"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 250));
      attempts.current += 1;
      if (attempts.current === 1) throw new Error("Temporary service failure");
      return "Customer activity restored";
    },
  });
  return (
    <Alert severity="success">
      <Typography>{data}</Typography>
    </Alert>
  );
}
