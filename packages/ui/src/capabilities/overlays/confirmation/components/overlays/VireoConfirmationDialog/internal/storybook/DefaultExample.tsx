import { VireoConfirmationDialog } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Stack, Typography } from "@mui/material";
import React from "react";

export default function DefaultExample() {
  const [open, setOpen] = React.useState(false);
  return (
    <VireoStorybookProvider>
      <Stack alignItems="flex-start" spacing={2}>
        <Typography>Open the dialog to review a controlled confirmation surface.</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Archive project
        </Button>
        <VireoConfirmationDialog
          open={open}
          title="Archive project?"
          message="Team members will no longer be able to edit this project."
          confirmLabel="Archive"
          confirmColor="warning"
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
        />
      </Stack>
    </VireoStorybookProvider>
  );
}
