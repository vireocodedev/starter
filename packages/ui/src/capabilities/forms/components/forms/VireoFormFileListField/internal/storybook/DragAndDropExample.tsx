import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function DragAndDropExample() {
  const form = useVireoForm({ defaultValues: { sourceFiles: [] as File[] } });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Import source files" variant="plain" layout="stack">
          <Typography color="text.secondary">Drag several JSON or CSV files onto the chooser in one batch.</Typography>
          <form.Field name="sourceFiles">
            {field => (
              <VireoLabelBox label="Source files">
                <field.FileListField
                  accept="application/json,text/csv,.json,.csv"
                  dropActiveText="Release all source files"
                  slotProps={{ input: { "aria-label": "Source files" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
