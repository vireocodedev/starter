import { Stack } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoMultiStepForm } from "@vireocodedev/ui/forms";
import { z } from "zod";

const schema = z.object({ name: z.string().min(2, "Enter a name."), email: z.string().email("Enter a valid email.") });
export default function ZodFormSchemaExample() {
  const form = useVireoMultiStepForm({
    defaultValues: { name: "", email: "" },
    onSubmit: () => undefined,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
    steps: [
      { id: "profile", label: "Profile", fields: ["name"] },
      { id: "contact", label: "Contact", fields: ["email"] },
    ],
  });
  return (
    <form.Form>
      <form.MultiStep keepMounted>
        <Stack spacing={2}>
          <form.StepProgress />
          <form.ErrorSummary scope="all" />
          <form.Step id="profile">
            <form.Field name="name">
              {field => (
                <VireoLabelBox label="Name" required>
                  <field.TextField slotProps={{ htmlInput: { "aria-label": "Name" } }} />
                </VireoLabelBox>
              )}
            </form.Field>
          </form.Step>
          <form.Step id="contact">
            <form.Field name="email">
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
