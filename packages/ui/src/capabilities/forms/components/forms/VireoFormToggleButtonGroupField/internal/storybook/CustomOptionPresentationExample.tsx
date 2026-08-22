import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import { Stack, Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const plans = [
  { value: "starter", label: "Starter" },
  { value: "team", label: "Team" },
  { value: "enterprise", label: "Enterprise", disabled: true },
] as const;

const descriptions = {
  starter: "For personal projects",
  team: "For collaborating groups",
  enterprise: "Contact sales",
} as const;

export default function CustomOptionPresentationExample() {
  const form = useVireoForm({ defaultValues: { plan: "starter" as string | null } });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Subscription" variant="plain" layout="stack">
          <form.Field name="plan">
            {field => (
              <VireoLabelBox label="Plan">
                <field.ToggleButtonGroupField
                  aria-label="Plan"
                  color="primary"
                  options={plans}
                  getOptionProps={option => ({ "data-plan": option.value })}
                  renderOption={(option, state) => (
                    <Stack direction="row" spacing={1} alignItems="center">
                      {state.selected ? <CheckCircleOutline /> : <RadioButtonUnchecked />}
                      <span>
                        <Typography component="span" fontWeight={700}>
                          {option.label}
                        </Typography>
                        <Typography component="span" display="block" variant="caption">
                          {descriptions[option.value]}
                        </Typography>
                      </span>
                    </Stack>
                  )}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
