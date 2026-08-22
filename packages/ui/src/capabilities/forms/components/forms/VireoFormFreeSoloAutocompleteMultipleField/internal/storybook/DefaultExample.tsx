import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const suggestions = ["React", "TypeScript", "Accessibility", "Design systems"];
export default function DefaultExample() {
  const [saved, setSaved] = React.useState<string[]>([]);
  const form = useVireoForm({ defaultValues: { skills: ["React"] }, onSubmit: ({ value }) => setSaved(value.skills) });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Skills" variant="plain" layout="stack">
          <form.Field name="skills">
            {field => (
              <VireoLabelBox label="Skills">
                <field.FreeSoloAutocompleteMultipleField
                  label={null}
                  options={suggestions}
                  getOptionValue={value => value}
                  getOptionLabel={value => value}
                  placeholder="Choose or create skills"
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
