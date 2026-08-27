import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

const strategies = [
  { id: "rolling", label: "Rolling deployment" },
  { id: "blue-green", label: "Blue-green deployment" },
  { id: "canary", label: "Canary deployment" },
] as const;

export default function DefaultExample() {
  const [savedStrategy, setSavedStrategy] = React.useState<string | null>(null);
  const form = useVireoForm({
    defaultValues: { strategy: null as string | null },
    onSubmit: ({ value }) => setSavedStrategy(value.strategy),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Deployment strategy" variant="plain" layout="stack">
          <form.Field name="strategy">
            {field => (
              <VireoLabelBox label="Deployment strategy">
                <field.RadioGroupField
                  aria-label="Deployment strategy"
                  options={strategies}
                  getOptionValue={strategy => strategy.id}
                  renderOption={strategy => strategy.label}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Save strategy</form.SubmitButton>
          </form.Actions>
          {savedStrategy && <Typography color="success.main">Saved {savedStrategy}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
