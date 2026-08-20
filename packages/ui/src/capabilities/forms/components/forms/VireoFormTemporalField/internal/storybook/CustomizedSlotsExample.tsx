import AccessTime from "@mui/icons-material/AccessTime";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function CustomizedSlotsExample() {
  const form = useVireoForm({ defaultValues: { reminder: "09:30:00" as string | null }, onSubmit: () => undefined });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Reminder" variant="plain" layout="stack">
          <form.Field name="reminder">
            {field => (
              <VireoLabelBox label="Reminder">
                <field.TemporalField
                  mode="time"
                  slots={{ openPickerIcon: AccessTime }}
                  slotProps={{
                    root: ownerState => ({ "data-mode": ownerState.mode }),
                    htmlInput: { "aria-label": "Reminder" },
                    openPickerButton: { color: "secondary" },
                  }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.ResetButton variant="outlined">Reset reminder</form.ResetButton>
          </form.Actions>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
