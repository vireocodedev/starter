import { Stack } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function DateTimeModeExample() {
  const form = useVireoForm({
    defaultValues: { startsAt: "2026-08-25T14:30:00" as string | null },
    onSubmit: () => undefined,
  });
  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field name="startsAt">
            {field => (
              <VireoLabelBox label="Starts at">
                <field.TemporalField
                  mode="date-time"
                  precision="second"
                  slotProps={{ htmlInput: { "aria-label": "Starts at" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.ResetButton variant="outlined">Reset date and time</form.ResetButton>
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
