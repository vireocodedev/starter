import { Stack } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

const plans = [
  { label: "Starter", value: "starter" },
  { label: "Enterprise", value: "enterprise" },
];

export default function ReadOnlyModeExample() {
  const form = useVireoForm({
    defaultValues: {
      active: true,
      name: "Ada Lovelace",
      notes: "",
      plan: "enterprise" as string | null,
    },
  });

  return (
    <VireoStorybookProvider>
      <form.Form readOnly readOnlyEmptyValue="Not provided">
        <Stack spacing={2}>
          <form.Field name="name">
            {field => (
              <VireoLabelBox label="Name">
                <field.TextField label={null} slotProps={{ htmlInput: { "aria-label": "Name" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="plan">
            {field => (
              <VireoLabelBox label="Plan">
                <field.SelectField
                  label={null}
                  options={plans}
                  getOptionValue={option => option.value}
                  renderOption={option => option.label}
                  slotProps={{ htmlInput: { "aria-label": "Plan" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="active">
            {field => (
              <field.SwitchField label="Active account" renderReadOnlyValue={value => (value ? "Yes" : "No")} />
            )}
          </form.Field>
          <form.Field name="notes">
            {field => (
              <VireoLabelBox label="Notes">
                <field.TextField label={null} slotProps={{ htmlInput: { "aria-label": "Notes" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
