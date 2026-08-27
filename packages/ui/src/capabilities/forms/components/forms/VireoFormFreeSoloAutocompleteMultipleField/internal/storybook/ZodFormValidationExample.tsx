import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3, "Enter a title."),
  labels: z.array(z.string()).min(1, "Add at least one label."),
});
export default function ZodFormValidationExample() {
  const form = useVireoForm({
    defaultValues: { title: "", labels: [] as string[] },
    onSubmit: () => undefined,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Form schema" variant="plain" layout="stack">
          <form.Field name="title">
            {field => (
              <VireoLabelBox label="Title">
                <field.TextField slotProps={{ htmlInput: { "aria-label": "Title" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="labels">
            {field => (
              <VireoLabelBox label="Labels" required>
                <field.FreeSoloAutocompleteMultipleField
                  label={null}
                  required
                  options={["Bug", "Feature", "Docs"]}
                  getOptionValue={value => value}
                  getOptionLabel={value => value}
                  slotProps={{ htmlInput: { "aria-label": "Labels" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Create issue</form.SubmitButton>
          </form.Actions>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
