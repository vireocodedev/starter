import { Stack } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoMultiStepForm } from "@vireocodedev/ui/forms";
import { z } from "zod";

export default function CompleteErrorSummaryExample() {
  const form = useVireoMultiStepForm({
    defaultValues: { name: "", email: "" },
    initialStepId: "contact",
    onSubmit: () => undefined,
    steps: [
      { id: "profile", label: "Profile", fields: ["name"] },
      { id: "contact", label: "Contact", fields: ["email"] },
    ],
  });
  return (
    <form.Form>
      <form.MultiStep keepMounted>
        <Stack spacing={2}>
          <form.StepProgress navigation="visited" />
          <form.ErrorSummary scope="all" />
          <form.Step id="profile">
            <form.Field name="name" validators={{ onSubmit: z.string().min(1, "Enter a name.") }}>
              {field => (
                <VireoLabelBox label="Name" required>
                  <field.TextField slotProps={{ htmlInput: { "aria-label": "Name" } }} />
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
            <form.SubmitButton>Validate all steps</form.SubmitButton>
          </form.Actions>
        </Stack>
      </form.MultiStep>
    </form.Form>
  );
}
