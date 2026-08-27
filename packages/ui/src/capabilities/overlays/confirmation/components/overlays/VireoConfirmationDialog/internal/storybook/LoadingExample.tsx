import { VireoConfirmationDialog } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Button } from "@mui/material";
import React from "react";

export default function LoadingExample() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const confirm = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 1200);
  };
  return (
    <VireoStorybookProvider>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Publish release
      </Button>
      <VireoConfirmationDialog
        open={open}
        loading={loading}
        title="Publish release?"
        message="Publishing makes this version available to every customer."
        confirmLabel="Publish"
        onClose={() => setOpen(false)}
        onConfirm={confirm}
      />
    </VireoStorybookProvider>
  );
}
