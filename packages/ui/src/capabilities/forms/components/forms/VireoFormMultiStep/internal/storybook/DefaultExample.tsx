import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoMultiStepForm } from "@vireocodedev/starter-ui/forms";

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
      </form.MultiStep>
    </form.Form>
  );
}
