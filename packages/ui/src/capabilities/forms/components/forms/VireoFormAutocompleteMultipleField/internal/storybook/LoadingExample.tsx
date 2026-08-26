import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const members = [
  { id: "maya", name: "Maya Chen" },
  { id: "sora", name: "Sora Tanaka" },
];

export default function LoadingExample() {
  const form = useVireoForm({
    defaultValues: { memberIds: ["maya"] as string[] },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Project members" variant="plain" layout="stack">
          <form.Field name="memberIds">
            {field => (
              <VireoLabelBox label="Members">
                <field.AutocompleteMultipleField
                  label={null}
                  loading
                  loadingText="Loading members…"
                  options={members}
                  getOptionValue={person => person.id}
                  getOptionLabel={person => person.name}
                  slotProps={{ htmlInput: { "aria-label": "Members" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
