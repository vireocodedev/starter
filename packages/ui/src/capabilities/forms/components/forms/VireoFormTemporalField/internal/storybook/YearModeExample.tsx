import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function YearModeExample() {
  const form = useVireoForm({ defaultValues: { reportingYear: "2026" as string | null }, onSubmit: () => undefined });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Year" variant="plain" layout="stack">
          <form.Field name="reportingYear">
            {field => (
              <VireoLabelBox label="Reporting year">
                <field.TemporalField mode="year" slotProps={{ htmlInput: { "aria-label": "Reporting year" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
