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
];
const roleSchema = z.enum(["viewer", "editor", "admin"]).nullable().refine(Boolean, "Choose an access role.");
export default function ZodFieldValidationExample() {
  const [saved, setSaved] = React.useState<string | null>(null);
  const form = useVireoForm({
    defaultValues: { roleId: null as string | null },
    onSubmit: ({ value }) => setSaved(value.roleId),
    validationLogic: revalidateLogic(),
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Access" variant="plain" layout="stack">
          <form.Field name="roleId" validators={{ onDynamic: roleSchema }}>
            {field => (
              <VireoLabelBox label="Role" required>
                <field.AutocompleteField
                  label={null}
                  required
                  options={roles}
                  getOptionValue={role => role.id}
                  getOptionLabel={role => role.label}
                  slotProps={{ htmlInput: { "aria-label": "Role" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Grant access</form.SubmitButton>
          </form.Actions>
          {saved && <Typography color="success.main">Granted {saved}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
