import { VireoConfirmationProvider, useVireoConfirmation } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Alert, Button, Stack } from "@mui/material";
import React from "react";

function DecisionButton() {
  const confirm = useVireoConfirmation();
  const [decision, setDecision] = React.useState<boolean | null>(null);
  const requestDelete = async () =>
    setDecision(
      await confirm({
        title: "Delete customer?",
        message: (
          <>
            This removes <strong>Northstar Analytics</strong> from the workspace.
          </>
        ),
        confirmLabel: "Delete",
        confirmColor: "error",
      }),
    );
  return (
    <Stack alignItems="flex-start" spacing={2}>
      <Button color="error" variant="contained" onClick={requestDelete}>
        Delete customer
      </Button>
      {decision != null && (
        <Alert severity={decision ? "success" : "info"}>{decision ? "Deletion confirmed" : "Deletion cancelled"}</Alert>
      )}
    </Stack>
  );
}

export default function ProviderHookExample() {
  return (
    <VireoStorybookProvider>
      <VireoConfirmationProvider>
        <DecisionButton />
      </VireoConfirmationProvider>
    </VireoStorybookProvider>
  );
}
