import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

const pages = ["cover.pdf", "proposal.pdf", "appendix.pdf"].map(
  name => new File([name], name, { type: "application/pdf" }),
);

export default function ReorderingExample() {
  const form = useVireoForm({ defaultValues: { pages } });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Document order" variant="plain" layout="stack">
          <form.Field name="pages">
            {field => (
              <VireoLabelBox label="Merged pages">
                <field.FileListField
                  reorderable
                  helperText="Drag a handle, or focus it and press Arrow Up or Arrow Down."
                  slotProps={{ input: { "aria-label": "Merged pages" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
