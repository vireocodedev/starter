import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const approvedFile = new File(["Approved"], "approved-contract.pdf", { type: "application/pdf" });

export default function DisabledAndReadOnlyExample() {
  const form = useVireoForm({
    defaultValues: { archived: approvedFile as File | null, approved: approvedFile as File | null },
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Non-interactive states" variant="plain">
          <form.Field name="archived">
            {field => (
              <VireoLabelBox label="Archived file">
                <field.FileField disabled slotProps={{ input: { "aria-label": "Archived file" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="approved">
            {field => (
              <VireoLabelBox label="Approved file">
                <field.FileField readOnly slotProps={{ input: { "aria-label": "Approved file" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
