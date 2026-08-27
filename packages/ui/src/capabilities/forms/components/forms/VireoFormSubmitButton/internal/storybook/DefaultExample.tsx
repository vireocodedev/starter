import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function DefaultExample() {
  const form = useVireoForm({
    defaultValues: { projectName: "Northstar" },
    onSubmit: async () => new Promise(resolve => setTimeout(resolve, 1200)),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Project" variant="plain" layout="stack">
          <form.Field name="projectName">
            {field => (
              <VireoLabelBox label="Project name">
                <field.TextField slotProps={{ htmlInput: { "aria-label": "Project name" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
        <form.Actions>
          <form.SubmitButton variant="contained">Save project</form.SubmitButton>
        </form.Actions>
      </form.Form>
    </VireoStorybookProvider>
  );
}
