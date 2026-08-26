import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function LoadingExample() {
  const form = useVireoForm({
    defaultValues: { tags: ["design-system"] as string[] },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Release tags" variant="plain" layout="stack">
          <form.Field name="tags">
            {field => (
              <VireoLabelBox label="Tags">
                <field.FreeSoloAutocompleteMultipleField
                  label={null}
                  loading
                  loadingText="Loading tag suggestions…"
                  options={["frontend", "backend", "design-system"]}
                  getOptionValue={value => value}
                  getOptionLabel={value => value}
                  slotProps={{ htmlInput: { "aria-label": "Tags" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
