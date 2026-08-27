import { Stack, Typography } from "@mui/material";
import { useVireoMultiStepForm } from "@vireocodedev/ui/forms";

export default function CompactProgressExample() {
  const form = useVireoMultiStepForm({
    defaultValues: {},
    onSubmit: () => undefined,
    steps: [
      { id: "details", label: "Details" },
      { id: "delivery", label: "Delivery" },
      { id: "review", label: "Review" },
    ],
  });
  return (
    <form.Form sx={{ maxWidth: 440 }}>
      <form.MultiStep>
        <Stack spacing={2}>
          <form.StepProgress layout="compact" navigation="all" />
          <form.Step id="details">
            <Typography>Order details</Typography>
          </form.Step>
          <form.Step id="delivery">
            <Typography>Delivery options</Typography>
          </form.Step>
          <form.Step id="review">
            <Typography>Order review</Typography>
          </form.Step>
          <form.Actions>
            <form.PreviousStepButton />
            <form.NextStepButton />
            <form.SubmitButton>Place order</form.SubmitButton>
          </form.Actions>
        </Stack>
      </form.MultiStep>
    </form.Form>
  );
}
