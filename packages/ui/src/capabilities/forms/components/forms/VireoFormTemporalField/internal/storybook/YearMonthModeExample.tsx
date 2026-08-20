import { Stack } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function YearMonthModeExample() {
  const form = useVireoForm({
    defaultValues: { billingPeriod: "2026-08" as string | null },
    onSubmit: () => undefined,
  });
  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field name="billingPeriod">
            {field => (
              <VireoLabelBox label="Billing period">
                <field.TemporalField mode="year-month" slotProps={{ htmlInput: { "aria-label": "Billing period" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.ResetButton variant="outlined">Reset period</form.ResetButton>
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
