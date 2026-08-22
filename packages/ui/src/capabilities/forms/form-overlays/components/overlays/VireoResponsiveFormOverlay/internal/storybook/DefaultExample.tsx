import { VireoResponsiveFormOverlay } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, TextField } from "@mui/material";
import { useState } from "react";

export default function DefaultExample() {
  const [open, setOpen] = useState(false);
  return (
    <VireoStorybookProvider>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Edit profile
      </Button>
      <VireoResponsiveFormOverlay
        open={open}
        onClose={() => setOpen(false)}
        title="Edit profile"
        closeLabel="Close profile form"
        actions={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained">Save</Button>
          </>
        }
      >
        <TextField fullWidth label="Display name" defaultValue="Maya Chen" />
      </VireoResponsiveFormOverlay>
    </VireoStorybookProvider>
  );
}
