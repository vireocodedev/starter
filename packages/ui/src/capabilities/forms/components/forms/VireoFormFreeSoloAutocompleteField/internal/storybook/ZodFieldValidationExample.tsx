import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";

const slugSchema = z
  .string()
  .min(3, "Enter at least three characters.")
  .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens.");
export default function ZodFieldValidationExample() {
  const form = useVireoForm({
    defaultValues: { slug: null as string | null },
    onSubmit: () => undefined,
    validationLogic: revalidateLogic(),
  });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Field schema" variant="plain" layout="stack">
          <form.Field name="slug" validators={{ onDynamic: slugSchema.nullable().refine(Boolean, "Enter a slug.") }}>
            {field => (
              <VireoLabelBox label="Slug" required>
                <field.FreeSoloAutocompleteField
                  label={null}
                  required
                  options={["starter-ui", "design-system"]}
                  getOptionValue={value => value}
                  getOptionLabel={value => value}
                  slotProps={{ htmlInput: { "aria-label": "Slug" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton>Save slug</form.SubmitButton>
          </form.Actions>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
