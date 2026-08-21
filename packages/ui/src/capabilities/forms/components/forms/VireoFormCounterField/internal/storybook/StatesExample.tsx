import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function StatesExample() {
  const form = useVireoForm({
    defaultValues: {
      disabled: 2 as number | null,
      readOnly: 3 as number | null,
      minimum: 0 as number | null,
      maximum: 5 as number | null,
      error: 2 as number | null,
    },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Counter states" variant="plain" maxColumns={2}>
          <form.Field name="disabled">
            {field => (
              <VireoLabelBox label="Disabled">
                <field.CounterField aria-label="Disabled" disabled />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="readOnly">
            {field => (
              <VireoLabelBox label="Read only">
                <field.CounterField aria-label="Read only" readOnly />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="minimum">
            {field => (
              <VireoLabelBox label="At minimum">
                <field.CounterField aria-label="At minimum" min={0} max={5} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="maximum">
            {field => (
              <VireoLabelBox label="At maximum">
                <field.CounterField aria-label="At maximum" min={0} max={5} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="error">
            {field => (
              <VireoLabelBox label="Direct error">
                <field.CounterField aria-label="Direct error" error helperText="Review this quantity." />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
