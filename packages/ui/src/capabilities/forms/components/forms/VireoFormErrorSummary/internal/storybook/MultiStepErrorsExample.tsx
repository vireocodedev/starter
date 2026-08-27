import { Stack } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoMultiStepForm } from "@vireocodedev/ui/forms";
import { z } from "zod";

export default function MultiStepErrorsExample() {
  const form = useVireoMultiStepForm({
    defaultValues: { name: "", email: "" },
    onSubmit: () => undefined,
    steps: [
      { id: "profile", label: "Profile", fields: ["name"] },
      { id: "contact", label: "Contact", fields: ["email"] },
    ],
  });
  return (
    <form.Form sx={{ maxWidth: 600 }}>
      <form.MultiStep>
        <Stack spacing={2}>
          <form.StepProgress navigation="visited" />
          <form.ErrorSummary scope="all" />
          <form.Step id="profile">
            <form.Field name="name" validators={{ onSubmit: z.string().min(1, "Enter a display name.") }}>
              {field => (
                <VireoLabelBox label="Display name" required>
                  <field.TextField slotProps={{ htmlInput: { "aria-label": "Display name" } }} />
                </VireoLabelBox>
              )}
            </form.Field>
          </form.Step>
          <form.Step id="contact">
            <form.Field name="email" validators={{ onSubmit: z.string().email("Enter a valid email.") }}>
              {field => (
                <VireoLabelBox label="Email" required>
                  <field.TextField slotProps={{ htmlInput: { "aria-label": "Email" } }} />
                </VireoLabelBox>
              )}
            </form.Field>
          </form.Step>
          <form.Actions>
            <form.PreviousStepButton />
            <form.NextStepButton />
            <form.SubmitButton>Save</form.SubmitButton>
          </form.Actions>
        </Stack>
      </form.MultiStep>
    </form.Form>
  );
}
