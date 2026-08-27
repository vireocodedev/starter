import { Stack, Typography } from "@mui/material";
import { useVireoMultiStepForm } from "@vireocodedev/ui/forms";

export default function DefaultExample() {
  const form = useVireoMultiStepForm({
    defaultValues: {},
    onSubmit: () => undefined,
    steps: [
      { id: "details", label: "Details" },
      { id: "review", label: "Review" },
    ],
  });
  return (
    <form.Form>
      <form.MultiStep>
        <Stack spacing={2}>
          <form.StepProgress />
          <form.Step id="details">
            <Typography>Continue to review.</Typography>
          </form.Step>
          <form.Step id="review">
            <Typography>The same action now submits.</Typography>
          </form.Step>
          <form.NextStepButton />
          <form.SubmitButton>Save workflow</form.SubmitButton>
        </Stack>
      </form.MultiStep>
    </form.Form>
  );
}
