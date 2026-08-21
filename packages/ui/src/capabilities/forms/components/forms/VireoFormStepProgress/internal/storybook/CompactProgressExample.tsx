import { Button, Stack, Typography } from "@mui/material";
import { useVireoMultiStepForm } from "@vireocodedev/starter-ui/forms";

export default function CompactProgressExample() {
  const form = useVireoMultiStepForm({
    defaultValues: {},
    onSubmit: () => undefined,
    steps: [
      { id: "details", label: "Details" },
      { id: "delivery", label: "Delivery" },
      { id: "confirmation", label: "Confirmation" },
    ],
  });
  return (
    <form.Form sx={{ maxWidth: 480 }}>
      <form.MultiStep>
        <Stack spacing={3}>
          <form.StepProgress layout="compact" navigation="all" />
          <form.Step id="details">
            <Typography>Enter order details.</Typography>
          </form.Step>
          <form.Step id="delivery">
            <Typography>Select delivery preferences.</Typography>
          </form.Step>
          <form.Step id="confirmation">
            <Typography>Confirm the order.</Typography>
          </form.Step>
          <Button type="button" variant="contained" disabled={form.isLastStep} onClick={() => void form.goToNextStep()}>
            Continue
          </Button>
        </Stack>
      </form.MultiStep>
    </form.Form>
  );
}
