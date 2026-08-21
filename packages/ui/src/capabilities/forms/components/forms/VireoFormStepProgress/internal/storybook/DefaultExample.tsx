import { Button, Stack, Typography } from "@mui/material";
import { useVireoMultiStepForm } from "@vireocodedev/starter-ui/forms";

export default function DefaultExample() {
  const form = useVireoMultiStepForm({
    defaultValues: {},
    onSubmit: () => undefined,
    steps: [
      { id: "account", label: "Account" },
      { id: "preferences", label: "Preferences" },
      { id: "review", label: "Review" },
    ],
  });
  return (
    <form.Form sx={{ maxWidth: 760 }}>
      <form.MultiStep>
        <Stack spacing={3}>
          <form.StepProgress />
          <form.Step id="account">
            <Typography>Choose account details.</Typography>
          </form.Step>
          <form.Step id="preferences">
            <Typography>Choose notification preferences.</Typography>
          </form.Step>
          <form.Step id="review">
            <Typography>Review the complete setup.</Typography>
          </form.Step>
          <Stack direction="row" spacing={1}>
            <Button type="button" disabled={form.isFirstStep} onClick={() => void form.goToPreviousStep()}>
              Previous
            </Button>
            <Button
              type="button"
              variant="contained"
              disabled={form.isLastStep}
              onClick={() => void form.goToNextStep()}
            >
              Next
            </Button>
          </Stack>
        </Stack>
      </form.MultiStep>
    </form.Form>
  );
}
