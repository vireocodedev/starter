import { Stack } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function TimeModeExample() {
  const form = useVireoForm({
    defaultValues: { dailyReminder: "09:30:00" as string | null },
    onSubmit: () => undefined,
  });
  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field name="dailyReminder">
            {field => (
              <VireoLabelBox label="Daily reminder">
                <field.TemporalField
                  mode="time"
                  precision="second"
                  slotProps={{ htmlInput: { "aria-label": "Daily reminder" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.ResetButton variant="outlined">Reset time</form.ResetButton>
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
