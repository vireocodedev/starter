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
        onConfirm: () => new Promise<void>(resolve => window.setTimeout(resolve, 1200)),
      }),
    );
  return (
    <Stack
      spacing={2}
      sx={{
        alignItems: "flex-start",
      }}
    >
      <Button color="error" variant="contained" onClick={requestDelete}>
        Delete customer
      </Button>
      {decision != null && (
        <Alert severity={decision ? "success" : "info"}>{decision ? "Customer deleted" : "Deletion cancelled"}</Alert>
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
