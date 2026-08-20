import { Stack, Typography } from "@mui/material";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

export default function DefaultExample() {
  const [savedName, setSavedName] = React.useState<string>();
  const form = useVireoForm({
    defaultValues: { projectName: "" },
    onSubmit: ({ value }) => setSavedName(value.projectName),
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field
            name="projectName"
            validators={{
              onBlur: ({ value }) => (value.trim() ? undefined : "Enter a project name."),
              onSubmit: ({ value }) => (value.trim() ? undefined : "Enter a project name."),
            }}
          >
            {field => <field.TextField label="Project name" placeholder="Northstar" />}
          </form.Field>
          <form.SubmitButton variant="contained">Save project</form.SubmitButton>
          {savedName && <Typography color="success.main">Saved {savedName}</Typography>}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
