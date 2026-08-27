import { VireoLabelBox, VireoResponsiveFormOverlay } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Button } from "@mui/material";
import { useState } from "react";

export default function DesktopSidePanelExample() {
  const [open, setOpen] = useState(false);
  const form = useVireoForm({
    defaultValues: { customerName: "Northstar Analytics", owner: "Maya Chen" },
    onSubmit: () => setOpen(false),
  });

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
        renderForm={children => (
          <form.Form layoutWidth="full" unsavedChangesGuard>
            {children}
          </form.Form>
        )}
        actions={({ requestClose }) => (
          <form.Actions>
            <Button onClick={requestClose}>Cancel</Button>
            <form.SubmitButton variant="contained">Save customer</form.SubmitButton>
          </form.Actions>
        )}
      >
        <form.Section label="Customer details" description="Account information shared with the workspace.">
          <form.Field name="customerName">
            {field => (
              <VireoLabelBox label="Customer name">
                <field.TextField label={null} slotProps={{ htmlInput: { "aria-label": "Customer name" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="owner">
            {field => (
              <VireoLabelBox label="Owner">
                <field.TextField label={null} slotProps={{ htmlInput: { "aria-label": "Owner" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </VireoResponsiveFormOverlay>
    </VireoStorybookProvider>
  );
}
