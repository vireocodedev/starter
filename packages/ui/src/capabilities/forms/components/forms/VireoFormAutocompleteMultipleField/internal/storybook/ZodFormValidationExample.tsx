import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";
const audiences = [
  { id: "staff", name: "Staff" },
  { id: "customers", name: "Customers" },
  { id: "partners", name: "Partners" },
];
const schema = z.object({
  title: z.string().min(3, "Enter a title."),
  audiences: z.array(z.string()).min(1, "Choose an audience."),
});
export default function ZodFormValidationExample() {
  const form = useVireoForm({
    defaultValues: { title: "", audiences: [] as string[] },
    onSubmit: () => undefined,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Announcement" variant="plain" layout="stack">
          <form.Field name="title">
            {field => (
              <VireoLabelBox label="Title">
                <field.TextField slotProps={{ htmlInput: { "aria-label": "Title" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="audiences">
            {field => (
              <VireoLabelBox label="Audiences" required>
                <field.AutocompleteMultipleField
                  label={null}
                  required
                  options={audiences}
                  getOptionValue={audience => audience.id}
                  getOptionLabel={audience => audience.name}
                  slotProps={{ htmlInput: { "aria-label": "Audiences" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Publish announcement</form.SubmitButton>
          </form.Actions>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
