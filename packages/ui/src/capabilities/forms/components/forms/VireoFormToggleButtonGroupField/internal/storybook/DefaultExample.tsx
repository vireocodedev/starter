import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const densities = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
] as const;

export default function DefaultExample() {
  const [saved, setSaved] = React.useState<string | null>(null);
  const form = useVireoForm({
    defaultValues: { density: null as string | null },
    onSubmit: ({ value }) => setSaved(value.density),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Interface" variant="plain" layout="stack">
          <form.Field name="density">
            {field => (
              <VireoLabelBox label="Density">
                <field.ToggleButtonGroupField aria-label="Density" options={densities} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.ResetButton>Reset</form.ResetButton>
            <form.SubmitButton>Save density</form.SubmitButton>
          </form.Actions>
          <Typography color="success.main">{saved ? `Saved ${saved}` : "No saved density"}</Typography>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
