import { VireoQueryBoundary } from "@vireocodedev/ui/tanstack-query";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Card, CardContent, Typography } from "@mui/material";
import { QueryClient, QueryClientProvider, useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

export default function DefaultExample() {
  const [client] = React.useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  return (
    <VireoStorybookProvider>
      <QueryClientProvider client={client}>
        <VireoQueryBoundary>
          <CustomerSummary />
        </VireoQueryBoundary>
      </QueryClientProvider>
    </VireoStorybookProvider>
  );
}

function CustomerSummary() {
  const { data } = useSuspenseQuery({
    queryKey: ["customer-summary"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 700));
      return { name: "Northstar Analytics", status: "Active" };
    },
  });
  return (
    <Card variant="outlined" sx={{ maxWidth: 420 }}>
      <CardContent>
        <Typography variant="h6">{data.name}</Typography>
        <Typography color="success.main">{data.status}</Typography>
      </CardContent>
    </Card>
  );
}
