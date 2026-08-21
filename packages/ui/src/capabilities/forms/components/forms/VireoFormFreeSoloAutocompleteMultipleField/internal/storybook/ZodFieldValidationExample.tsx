import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";

const tagsSchema = z.array(z.string().min(2)).min(2, "Add at least two tags.").max(4, "Use no more than four tags.");
export default function ZodFieldValidationExample() {
  const form = useVireoForm({
    defaultValues: { tags: [] as string[] },
    onSubmit: () => undefined,
    validationLogic: revalidateLogic(),
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Field schema" variant="plain" layout="stack">
          <form.Field name="tags" validators={{ onDynamic: tagsSchema }}>
            {field => (
              <VireoLabelBox label="Tags" required>
                <field.FreeSoloAutocompleteMultipleField
                  label={null}
                  required
                  options={["frontend", "backend"]}
                  getOptionValue={value => value}
                  getOptionLabel={value => value}
                  slotProps={{ htmlInput: { "aria-label": "Tags" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Save tags</form.SubmitButton>
          </form.Actions>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
