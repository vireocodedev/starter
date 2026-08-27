import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function DateTimeModeExample() {
  const form = useVireoForm({
    defaultValues: { startsAt: "2026-08-25T14:30:00" as string | null },
    onSubmit: () => undefined,
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Date and time" variant="plain" layout="stack">
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
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
