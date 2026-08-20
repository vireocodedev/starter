import { Stack, Typography } from "@mui/material";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";

const roles = [
  { id: "viewer", label: "Viewer" },
  { id: "editor", label: "Editor" },
  { id: "admin", label: "Administrator" },
] as const;

const roleSchema = z
  .enum(["viewer", "editor", "admin"])
  .nullable()
  .refine(role => role !== null, "Choose an access role.");

export default function ZodFieldValidationExample() {
  const [savedRole, setSavedRole] = React.useState<string | null>(null);
  const form = useVireoForm({
    defaultValues: { role: null as string | null },
    onSubmit: ({ value }) => setSavedRole(value.role),
    validationLogic: revalidateLogic(),
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 520 }}>
        <Stack spacing={2}>
          <form.Field name="role" validators={{ onDynamic: roleSchema }}>
            {field => (
              <field.SelectField
                label="Access role"
                placeholder="Choose a role"
                options={roles}
                getOptionValue={role => role.id}
                renderOption={role => role.label}
              />
            )}
          </form.Field>
          <form.SubmitButton>Save access</form.SubmitButton>
          {savedRole && <Typography color="success.main">Saved {savedRole}</Typography>}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
