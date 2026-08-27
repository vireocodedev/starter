import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function TimeModeExample() {
  const form = useVireoForm({
    defaultValues: { dailyReminder: "09:30:00" as string | null },
    onSubmit: () => undefined,
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Time" variant="plain" layout="stack">
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
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
