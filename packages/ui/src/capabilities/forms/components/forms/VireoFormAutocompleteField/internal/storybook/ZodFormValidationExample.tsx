import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";

const teams = [
  { id: "platform", name: "Platform" },
  { id: "design", name: "Design" },
  { id: "ops", name: "Operations" },
];
const schema = z.object({
  projectName: z.string().min(3, "Enter at least three characters."),
  teamId: z.string().nullable().refine(Boolean, "Choose a team."),
});
export default function ZodFormValidationExample() {
  const [saved, setSaved] = React.useState(false);
  const form = useVireoForm({
    defaultValues: { projectName: "", teamId: null as string | null },
    onSubmit: () => setSaved(true),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Project" variant="plain" layout="stack">
          <form.Field name="projectName">
            {field => (
              <VireoLabelBox label="Project name">
                <field.TextField slotProps={{ htmlInput: { "aria-label": "Project name" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="teamId">
            {field => (
              <VireoLabelBox label="Team" required>
                <field.AutocompleteField
                  label={null}
                  required
                  options={teams}
                  getOptionValue={team => team.id}
                  getOptionLabel={team => team.name}
                  slotProps={{ htmlInput: { "aria-label": "Team" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Create project</form.SubmitButton>
          </form.Actions>
          {saved && <Typography color="success.main">Project created</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
