import { VireoQueryBoundary } from "@vireocodedev/starter-ui/tanstack-query";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const diagnosticError = Object.assign(new Error("Request failed"), {
  response: { status: 503, data: { code: "UPSTREAM_UNAVAILABLE", requestId: "req_82NA" } },
});

function FailedContent(): never {
  throw diagnosticError;
}

export default function ErrorDetailsExample() {
  const [client] = React.useState(() => new QueryClient());
  return (
    <VireoStorybookProvider>
      <QueryClientProvider client={client}>
        <VireoQueryBoundary
          retryable={false}
          errorTitle="Could not load customer"
          selectErrorDetails={error => (error as typeof diagnosticError).response}
        >
          <FailedContent />
        </VireoQueryBoundary>
      </QueryClientProvider>
    </VireoStorybookProvider>
  );
}
