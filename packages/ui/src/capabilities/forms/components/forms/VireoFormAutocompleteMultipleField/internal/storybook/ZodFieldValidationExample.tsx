import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";
const reviewers = [
  { id: "maya", name: "Maya Chen" },
  { id: "niko", name: "Niko Barić" },
  { id: "sora", name: "Sora Tanaka" },
];
const schema = z.array(z.enum(["maya", "niko", "sora"])).min(2, "Choose at least two reviewers.");
export default function ZodFieldValidationExample() {
  const form = useVireoForm({
    defaultValues: { reviewers: [] as string[] },
    onSubmit: () => undefined,
    validationLogic: revalidateLogic(),
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Review" variant="plain" layout="stack">
          <form.Field name="reviewers" validators={{ onDynamic: schema }}>
            {field => (
              <VireoLabelBox label="Reviewers" required>
                <field.AutocompleteMultipleField
                  label={null}
                  required
                  options={reviewers}
                  getOptionValue={reviewer => reviewer.id}
                  getOptionLabel={reviewer => reviewer.name}
                  slotProps={{ htmlInput: { "aria-label": "Reviewers" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Request review</form.SubmitButton>
          </form.Actions>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
