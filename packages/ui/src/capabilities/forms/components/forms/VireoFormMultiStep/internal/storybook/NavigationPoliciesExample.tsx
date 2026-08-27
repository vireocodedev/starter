import { Stack, Typography } from "@mui/material";
import { useVireoMultiStepForm } from "@vireocodedev/ui/forms";

export default function NavigationPoliciesExample() {
  const form = useVireoMultiStepForm({
    defaultValues: {},
    onSubmit: () => undefined,
    steps: [
      { id: "one", label: "Visited only" },
      { id: "two", label: "Second" },
      { id: "three", label: "Third" },
    ],
  });
  return (
    <form.Form>
      <form.MultiStep>
        <Stack spacing={2}>
          <form.StepProgress navigation="visited" />
          <form.Step id="one">
            <Typography>Upcoming steps remain locked.</Typography>
          </form.Step>
          <form.Step id="two">
            <Typography>Previously visited steps are selectable.</Typography>
          </form.Step>
          <form.Step id="three">
            <Typography>Review</Typography>
          </form.Step>
          <form.Actions>
            <form.PreviousStepButton />
            <form.NextStepButton />
            <form.SubmitButton>Finish</form.SubmitButton>
          </form.Actions>
        </Stack>
      </form.MultiStep>
    </form.Form>
  );
}
