import { Stack, Typography } from "@mui/material";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";

const regions = [
  { code: "eu", name: "Europe" },
  { code: "us", name: "United States" },
  { code: "apac", name: "Asia Pacific" },
] as const;

const workspaceSchema = z.object({
  workspaceName: z.string().min(3, "Enter at least three characters."),
  region: z
    .enum(["eu", "us", "apac"])
    .nullable()
    .refine(region => region !== null, "Choose a region."),
});

export default function ZodFormValidationExample() {
  const [savedWorkspace, setSavedWorkspace] = React.useState<string | null>(null);
  const form = useVireoForm({
    defaultValues: { workspaceName: "", region: null as string | null },
    onSubmit: ({ value }) => setSavedWorkspace(`${value.workspaceName} (${value.region})`),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: workspaceSchema },
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 520 }}>
        <Stack spacing={2}>
          <form.Field name="workspaceName">{field => <field.TextField label="Workspace name" />}</form.Field>
          <form.Field name="region">
            {field => (
              <field.SelectField
                label="Data region"
                placeholder="Choose a region"
                options={regions}
                getOptionValue={region => region.code}
                renderOption={region => region.name}
              />
            )}
          </form.Field>
          <form.SubmitButton>Create workspace</form.SubmitButton>
          {savedWorkspace && <Typography color="success.main">Created {savedWorkspace}</Typography>}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
