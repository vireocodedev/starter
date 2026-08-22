import { Stack, Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoMultiStepForm } from "@vireocodedev/starter-ui/forms";
import { z } from "zod";

export default function FieldValidationExample() {
  const form = useVireoMultiStepForm({
    defaultValues: { project: "" },
    onSubmit: () => undefined,
    steps: [
      { id: "project", label: "Project", fields: ["project"] },
      { id: "review", label: "Review" },
    ],
  });
  return (
    <form.Form>
      <form.MultiStep>
        <Stack spacing={2}>
          <form.StepProgress />
          <form.ErrorSummary scope="all" />
          <form.Step id="project">
            <form.Field name="project" validators={{ onSubmit: z.string().min(3, "Use at least three characters.") }}>
              {field => (
                <VireoLabelBox label="Project name" required>
                  <field.TextField slotProps={{ htmlInput: { "aria-label": "Project name" } }} />
                </VireoLabelBox>
              )}
            </form.Field>
          </form.Step>
          <form.Step id="review">
            <Typography>The field passed its own schema.</Typography>
          </form.Step>
          <form.Actions>
            <form.PreviousStepButton />
            <form.NextStepButton />
            <form.SubmitButton>Create</form.SubmitButton>
          </form.Actions>
        </Stack>
      </form.MultiStep>
    </form.Form>
  );
}
