import { Stack, Typography } from "@mui/material";
import { useVireoMultiStepForm } from "@vireocodedev/starter-ui/forms";

export default function DefaultExample() {
  const form = useVireoMultiStepForm({
    defaultValues: {},
    initialStepId: "review",
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
            <Typography>Details step</Typography>
          </form.Step>
          <form.Step id="review">
            <Typography>Review step</Typography>
          </form.Step>
          <form.PreviousStepButton />
        </Stack>
      </form.MultiStep>
    </form.Form>
  );
}
