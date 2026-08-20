import { Stack, Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
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
      <form.Form sx={{ maxWidth: 520 }}>
        <Stack spacing={2}>
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
          <Stack direction="row" spacing={1}>
            <form.SubmitButton>Save strategy</form.SubmitButton>
            <form.ResetButton>Reset</form.ResetButton>
          </Stack>
          {savedStrategy && <Typography color="success.main">Saved {savedStrategy}</Typography>}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
