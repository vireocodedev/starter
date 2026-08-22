import { VireoResponsiveFormOverlay } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, TextField } from "@mui/material";
import { useState } from "react";

export default function DesktopSidePanelExample() {
  const [open, setOpen] = useState(false);
  return (
    <VireoStorybookProvider>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Edit customer
      </Button>
      <VireoResponsiveFormOverlay
        open={open}
        onClose={() => setOpen(false)}
        title="Edit customer"
        closeLabel="Close customer form"
        desktopSurface="overlaySidePanel"
        desktopSidePanelWidth={520}
        actions={<Button variant="contained">Save customer</Button>}
      >
        <TextField fullWidth label="Customer name" defaultValue="Northstar Analytics" />
      </VireoResponsiveFormOverlay>
    </VireoStorybookProvider>
  );
}
