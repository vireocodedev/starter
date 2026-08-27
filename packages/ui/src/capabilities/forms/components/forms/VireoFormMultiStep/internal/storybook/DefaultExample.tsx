import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoMultiStepForm } from "@vireocodedev/ui/forms";

export default function DefaultExample() {
  const form = useVireoMultiStepForm({
    defaultValues: { name: "Northstar", email: "team@example.com" },
    onSubmit: () => undefined,
    steps: [
      { id: "profile", label: "Profile", fields: ["name"] },
      { id: "contact", label: "Contact", fields: ["email"] },
    ],
  });

  return (
    <form.Form>
      <form.MultiStep aria-label="Account setup">
        <form.StepProgress />
        <form.ErrorSummary scope="all" />
        <form.Step id="profile">
          <form.Section label="Profile">
            <form.Field name="name">
              {field => (
                <VireoLabelBox label="Display name">
                  <field.TextField slotProps={{ htmlInput: { "aria-label": "Display name" } }} />
                </VireoLabelBox>
              )}
            </form.Field>
          </form.Section>
        </form.Step>
        <form.Step id="contact">
          <form.Section label="Contact">
            <form.Field name="email">
              {field => (
                <VireoLabelBox label="Email">
                  <field.TextField slotProps={{ htmlInput: { "aria-label": "Email" } }} />
                </VireoLabelBox>
              )}
            </form.Field>
          </form.Section>
        </form.Step>
        <form.Actions>
          <form.PreviousStepButton />
          <form.NextStepButton />
          <form.SubmitButton>Save account</form.SubmitButton>
        </form.Actions>
      </form.MultiStep>
    </form.Form>
  );
}
