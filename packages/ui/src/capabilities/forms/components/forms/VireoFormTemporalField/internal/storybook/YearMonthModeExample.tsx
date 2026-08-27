import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function YearMonthModeExample() {
  const form = useVireoForm({
    defaultValues: { billingPeriod: "2026-08" as string | null },
    onSubmit: () => undefined,
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Year and month" variant="plain" layout="stack">
          <form.Field name="billingPeriod">
            {field => (
              <VireoLabelBox label="Billing period">
                <field.TemporalField mode="year-month" slotProps={{ htmlInput: { "aria-label": "Billing period" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
