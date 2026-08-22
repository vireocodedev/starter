import { VireoQueryBoundary } from "@vireocodedev/starter-ui/tanstack-query";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

function PendingContent(): never {
  throw new Promise(() => undefined);
}

export default function LoadingExample() {
  const [client] = React.useState(() => new QueryClient());
  return (
    <VireoStorybookProvider>
      <QueryClientProvider client={client}>
        <VireoQueryBoundary loadingLabel="Loading customer activity">
          <PendingContent />
        </VireoQueryBoundary>
      </QueryClientProvider>
    </VireoStorybookProvider>
  );
}
