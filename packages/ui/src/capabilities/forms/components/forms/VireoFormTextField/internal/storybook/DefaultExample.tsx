import { Stack, Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

export default function DefaultExample() {
  const [savedName, setSavedName] = React.useState<string>();
  const form = useVireoForm({
    defaultValues: { projectName: "" },
    onSubmit: ({ value }) => setSavedName(value.projectName),
    validationLogic: revalidateLogic(),
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field
            name="projectName"
            validators={{
              onDynamic: ({ value }) => (value.trim() ? undefined : "Enter a project name."),
            }}
          >
            {field => (
              <VireoLabelBox label="Project name">
                <field.TextField placeholder="Northstar" slotProps={{ htmlInput: { "aria-label": "Project name" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.SubmitButton variant="contained">Save project</form.SubmitButton>
          {savedName && <Typography color="success.main">Saved {savedName}</Typography>}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
