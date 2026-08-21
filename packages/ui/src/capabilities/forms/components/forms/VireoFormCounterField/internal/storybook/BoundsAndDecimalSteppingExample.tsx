import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function BoundsAndDecimalSteppingExample() {
  const form = useVireoForm({
    defaultValues: { allocation: 0.3 as number | null, importedQuantity: 12 as number | null },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section
          label="Bounded values"
          description="Decimal steps remain precise, while an imported out-of-range value can move directly back to its bound."
          variant="plain"
        >
          <form.Field name="allocation">
            {field => (
              <VireoLabelBox label="Allocation">
                <field.CounterField aria-label="Allocation" min={0} max={1} step={0.1} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="importedQuantity">
            {field => (
              <VireoLabelBox label="Imported quantity">
                <field.CounterField
                  aria-label="Imported quantity"
                  helperText="The next decrement corrects 12 to the maximum of 10."
                  min={0}
                  max={10}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.SectionItem span="full">
            <Typography color="text.secondary" variant="body2">
              Type a decimal directly or use Arrow Up, Arrow Down, and the step buttons.
            </Typography>
          </form.SectionItem>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
