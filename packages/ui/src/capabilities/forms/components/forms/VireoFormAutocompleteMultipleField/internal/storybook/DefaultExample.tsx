import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";
const skills = [
  { id: "react", name: "React" },
  { id: "typescript", name: "TypeScript" },
  { id: "testing", name: "Testing" },
  { id: "design", name: "Design systems" },
];
export default function DefaultExample() {
  const [saved, setSaved] = React.useState<string[]>([]);
  const form = useVireoForm({
    defaultValues: { skillIds: ["react", "typescript"] as string[] },
    onSubmit: ({ value }) => setSaved(value.skillIds),
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Contributor profile" variant="plain" layout="stack">
          <form.Field name="skillIds">
            {field => (
              <VireoLabelBox label="Skills">
                <field.AutocompleteMultipleField
                  label={null}
                  options={skills}
                  getOptionValue={skill => skill.id}
                  getOptionLabel={skill => skill.name}
                  slotProps={{ htmlInput: { "aria-label": "Skills" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Save skills</form.SubmitButton>
          </form.Actions>
          {saved.length > 0 && <Typography color="success.main">Saved {saved.join(", ")}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
