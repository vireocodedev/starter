import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const documents = [
  new File(["signed"], "signed-contract.pdf", { type: "application/pdf" }),
  new File(["terms"], "terms.pdf", { type: "application/pdf" }),
];

export default function DisabledAndReadOnlyExample() {
  const form = useVireoForm({ defaultValues: { archived: documents, approved: documents } });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Non-interactive collections" variant="plain">
          <form.Field name="archived">
            {field => (
              <VireoLabelBox label="Archived documents">
                <field.FileListField disabled slotProps={{ input: { "aria-label": "Archived documents" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="approved">
            {field => (
              <VireoLabelBox label="Approved documents">
                <field.FileListField readOnly slotProps={{ input: { "aria-label": "Approved documents" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
