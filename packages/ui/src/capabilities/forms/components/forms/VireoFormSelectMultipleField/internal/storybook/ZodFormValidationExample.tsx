import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";

const environments = [
  { id: "development", label: "Development" },
  { id: "staging", label: "Staging" },
  { id: "production", label: "Production" },
] as const;

const deploymentSchema = z.object({
  releaseName: z.string().trim().min(3, "Enter a release name."),
  environments: z.array(z.enum(["development", "staging", "production"])).min(1, "Choose an environment."),
});

export default function ZodFormValidationExample() {
  const [savedRelease, setSavedRelease] = React.useState("");
  const form = useVireoForm({
    defaultValues: { releaseName: "", environments: [] as string[] },
    onSubmit: ({ value }) => setSavedRelease(value.releaseName),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: deploymentSchema },
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Release" variant="plain" layout="stack">
          <form.Field name="releaseName">
            {field => (
              <VireoLabelBox label="Release name" required>
                <field.TextField
                  required
                  placeholder="August launch"
                  slotProps={{ htmlInput: { "aria-label": "Release name" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Field name="environments">
            {field => (
              <VireoLabelBox label="Target environments" required>
                <field.SelectMultipleField
                  label={null}
                  required
                  placeholder="Choose environments"
                  options={environments}
                  getOptionValue={environment => environment.id}
                  renderOption={environment => environment.label}
                  slotProps={{ select: { SelectDisplayProps: { "aria-label": "Target environments" } } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton variant="contained">Create release</form.SubmitButton>
          </form.Actions>
          {savedRelease && <Typography color="success.main">Created {savedRelease}</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
