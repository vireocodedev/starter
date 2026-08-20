import { Stack } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function YearModeExample() {
  const form = useVireoForm({ defaultValues: { reportingYear: "2026" as string | null }, onSubmit: () => undefined });
  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field name="reportingYear">
            {field => (
              <VireoLabelBox label="Reporting year">
                <field.TemporalField mode="year" slotProps={{ htmlInput: { "aria-label": "Reporting year" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.ResetButton variant="outlined">Reset year</form.ResetButton>
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
