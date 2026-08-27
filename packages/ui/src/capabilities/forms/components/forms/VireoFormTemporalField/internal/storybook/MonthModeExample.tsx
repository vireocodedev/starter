import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function MonthModeExample() {
  const form = useVireoForm({ defaultValues: { fiscalMonth: "08" as string | null }, onSubmit: () => undefined });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Month" variant="plain" layout="stack">
          <form.Field name="fiscalMonth">
            {field => (
              <VireoLabelBox label="Fiscal month">
                <field.TemporalField mode="month" slotProps={{ htmlInput: { "aria-label": "Fiscal month" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
