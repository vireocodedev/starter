import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function DragAndDropExample() {
  const form = useVireoForm({ defaultValues: { brief: null as File | null } });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Campaign brief" variant="plain" layout="stack">
          <Typography color="text.secondary">
            Drag one PDF anywhere over the field, or use the choose button.
          </Typography>
          <form.Field name="brief">
            {field => (
              <VireoLabelBox label="Brief">
                <field.FileField
                  accept="application/pdf,.pdf"
                  dropActiveText="Release the campaign brief"
                  slotProps={{ input: { "aria-label": "Campaign brief" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
