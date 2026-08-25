import { VireoLabelBox, VireoResponsiveFormOverlay } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button } from "@mui/material";
import { useState } from "react";

export default function DefaultExample() {
  const [open, setOpen] = useState(false);
  const form = useVireoForm({
    defaultValues: { displayName: "Maya Chen", role: "Operations lead" },
    onSubmit: () => setOpen(false),
  });

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
        renderForm={children => (
          <form.Form layoutWidth="full" unsavedChangesGuard>
            {children}
          </form.Form>
        )}
        actions={({ requestClose }) => (
          <form.Actions>
            <Button onClick={requestClose}>Cancel</Button>
            <form.SubmitButton variant="contained">Save profile</form.SubmitButton>
          </form.Actions>
        )}
      >
        <form.Section label="Profile details" description="Information displayed across the workspace.">
          <form.Field name="displayName">
            {field => (
              <VireoLabelBox label="Display name">
                <field.TextField label={null} slotProps={{ htmlInput: { "aria-label": "Display name" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="role">
            {field => (
              <VireoLabelBox label="Role">
                <field.TextField label={null} slotProps={{ htmlInput: { "aria-label": "Role" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </VireoResponsiveFormOverlay>
    </VireoStorybookProvider>
  );
}
