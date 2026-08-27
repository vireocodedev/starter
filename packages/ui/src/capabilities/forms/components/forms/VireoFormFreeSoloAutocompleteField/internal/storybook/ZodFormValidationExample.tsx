import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";

const schema = z.object({
  project: z.string().min(3, "Enter a project name."),
  category: z.string().nullable().refine(Boolean, "Choose or create a category."),
});
export default function ZodFormValidationExample() {
  const form = useVireoForm({
    defaultValues: { project: "", category: null as string | null },
    onSubmit: () => undefined,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Form schema" variant="plain" layout="stack">
          <form.Field name="project">
            {field => (
              <VireoLabelBox label="Project">
                <field.TextField slotProps={{ htmlInput: { "aria-label": "Project" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="category">
            {field => (
              <VireoLabelBox label="Category" required>
                <field.FreeSoloAutocompleteField
                  label={null}
                  required
                  options={["Product", "Platform"]}
                  getOptionValue={value => value}
                  getOptionLabel={value => value}
                  slotProps={{ htmlInput: { "aria-label": "Category" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Create project</form.SubmitButton>
          </form.Actions>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
