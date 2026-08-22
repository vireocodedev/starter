import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const initialFiles = [
  new File(["invoice"], "invoice.pdf", { type: "application/pdf" }),
  new File(["receipt"], "receipt.pdf", { type: "application/pdf" }),
];

export default function AppendingFilesExample() {
  const form = useVireoForm({ defaultValues: { evidence: initialFiles } });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Expense evidence" variant="plain" layout="stack">
          <form.Field name="evidence">
            {field => (
              <VireoLabelBox label="Evidence files">
                <field.FileListField
                  accept="application/pdf,.pdf"
                  helperText="Every selection appends to the existing ordered collection."
                  slotProps={{ input: { "aria-label": "Evidence files" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
