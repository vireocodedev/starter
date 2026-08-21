import { Button, Stack, Typography } from "@mui/material";
import { useVireoMultiStepForm } from "@vireocodedev/starter-ui/forms";

export default function NavigationPoliciesExample() {
  const form = useVireoMultiStepForm({
    defaultValues: {},
    onSubmit: () => undefined,
    steps: [
      { id: "first", label: "Visited navigation" },
      { id: "second", label: "Second step" },
      { id: "third", label: "Third step" },
    ],
  });
  return (
    <form.Form sx={{ maxWidth: 760 }}>
      <form.MultiStep>
        <Stack spacing={3}>
          <form.StepProgress navigation="visited" />
          <form.Step id="first">
            <Typography>Future steps are locked until reached.</Typography>
          </form.Step>
          <form.Step id="second">
            <Typography>The first step is now directly navigable.</Typography>
          </form.Step>
          <form.Step id="third">
            <Typography>All visited steps remain available.</Typography>
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
              Visit next step
            </Button>
          </Stack>
        </Stack>
      </form.MultiStep>
    </form.Form>
  );
}
