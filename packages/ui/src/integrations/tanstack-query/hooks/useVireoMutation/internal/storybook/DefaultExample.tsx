import { useVireoMutation } from "@vireocodedev/ui/tanstack-query";
import { VireoToaster } from "@vireocodedev/ui/sonner";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Button, Stack, Typography } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { z } from "zod";

const errorSchema = z.object({ code: z.string(), suggestion: z.string() });

export default function DefaultExample() {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <VireoStorybookProvider>
      <QueryClientProvider client={queryClient}>
        <MutationExample />
        <VireoToaster />
      </QueryClientProvider>
    </VireoStorybookProvider>
  );
}

function MutationExample() {
  const save = useVireoMutation({
    mutationFn: async ({ succeed }: { succeed: boolean }) => {
      await new Promise(resolve => setTimeout(resolve, 350));
      if (!succeed) {
        throw Object.assign(new Error("Save failed"), {
          response: { data: { code: "NAME_TAKEN", suggestion: "Northstar Europe" } },
        });
      }
      return { name: "Northstar" };
    },
    successMessage: data => `Saved ${data.name}`,
    errorMessage: "Could not save the workspace",
    errorDetails: { schema: errorSchema },
  });

  return (
    <Stack spacing={2} sx={{ maxWidth: 520 }}>
      <Typography variant="h6">Workspace mutation</Typography>
      <Typography color="text.secondary">
        Run either outcome. Error details are rendered only after the selected payload passes the Zod schema.
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button variant="contained" disabled={save.isPending} onClick={() => save.mutate({ succeed: true })}>
          Save successfully
        </Button>
        <Button color="error" disabled={save.isPending} onClick={() => save.mutate({ succeed: false })}>
          Simulate error
        </Button>
      </Stack>
    </Stack>
  );
}
