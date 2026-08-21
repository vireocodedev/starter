import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function NullableValueExample() {
  const form = useVireoForm({
    defaultValues: { quantity: null as number | null },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Optional quantity" variant="plain" layout="stack">
          <form.Field name="quantity">
            {field => (
              <VireoLabelBox label="Quantity">
                <field.CounterField
                  aria-label="Quantity"
                  helperText="An empty counter stores null; its first step starts from zero."
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Subscribe selector={state => state.values.quantity}>
            {quantity => (
              <Typography color="text.secondary">Stored value: {quantity === null ? "null" : quantity}</Typography>
            )}
          </form.Subscribe>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
