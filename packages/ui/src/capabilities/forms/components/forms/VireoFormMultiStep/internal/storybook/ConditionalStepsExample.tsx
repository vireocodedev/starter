import { Stack, Typography } from "@mui/material";
import { useVireoMultiStepForm } from "@vireocodedev/starter-ui/forms";

export default function ConditionalStepsExample() {
  const form = useVireoMultiStepForm({
    defaultValues: { needsApproval: false, approvalNote: "" },
    onSubmit: () => undefined,
    steps: [
      { id: "request", label: "Request", fields: ["needsApproval"] },
      { id: "approval", label: "Approval", fields: ["approvalNote"], when: values => values.needsApproval },
      { id: "review", label: "Review" },
    ],
  });
  return (
    <form.Form>
      <form.MultiStep>
        <Stack spacing={2}>
          <form.StepProgress />
          <form.Step id="request">
            <form.Field name="needsApproval">{field => <field.SwitchField label="Require approval" />}</form.Field>
          </form.Step>
          <form.Step id="approval">
            <Typography>Approval appears only when requested.</Typography>
          </form.Step>
          <form.Step id="review">
            <Typography>Review the active workflow.</Typography>
          </form.Step>
          <form.Actions>
            <form.PreviousStepButton />
            <form.NextStepButton />
            <form.SubmitButton>Submit request</form.SubmitButton>
          </form.Actions>
        </Stack>
      </form.MultiStep>
    </form.Form>
  );
}
