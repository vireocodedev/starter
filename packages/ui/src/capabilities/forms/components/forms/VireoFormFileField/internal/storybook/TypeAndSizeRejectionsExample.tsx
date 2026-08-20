import { Alert } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm, type VireoFileRejection } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

export default function TypeAndSizeRejectionsExample() {
  const [lastRejection, setLastRejection] = React.useState<VireoFileRejection>();
  const form = useVireoForm({ defaultValues: { avatar: null as File | null } });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Avatar requirements" variant="plain" layout="stack">
          <form.Field name="avatar">
            {field => (
              <VireoLabelBox label="Avatar">
                <field.FileField
                  accept="image/png,image/jpeg,.jpg"
                  maxSize={500_000}
                  onFileRejected={setLastRejection}
                  helperText="PNG or JPEG, up to 500 kB. A rejected file does not replace the current value."
                  slotProps={{ input: { "aria-label": "Avatar" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          {lastRejection && (
            <Alert severity="warning">
              Rejected {lastRejection.file.name} because of its {lastRejection.reason}.
            </Alert>
          )}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
