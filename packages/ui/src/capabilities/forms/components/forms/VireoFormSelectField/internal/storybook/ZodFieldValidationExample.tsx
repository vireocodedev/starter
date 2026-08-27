import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
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
      <form.Form>
        <form.Section label="Access level" variant="plain" layout="stack">
          <form.Field name="role" validators={{ onDynamic: roleSchema }}>
            {field => (
              <VireoLabelBox label="Access role">
                <field.SelectField
                  label={null}
                  placeholder="Choose a role"
                  options={roles}
                  getOptionValue={role => role.id}
                  renderOption={role => role.label}
                  slotProps={{ select: { SelectDisplayProps: { "aria-label": "Access role" } } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Save access</form.SubmitButton>
          </form.Actions>
          {savedRole && <Typography color="success.main">Saved {savedRole}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
