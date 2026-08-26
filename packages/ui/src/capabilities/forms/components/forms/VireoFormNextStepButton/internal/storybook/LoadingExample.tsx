import { Typography } from "@mui/material";
import { useVireoMultiStepForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function LoadingExample() {
  const form = useVireoMultiStepForm({
    defaultValues: {},
    onSubmit: () => undefined,
    steps: [
      { id: "details", label: "Details" },
      { id: "review", label: "Review" },
    ],
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.MultiStep>
          <form.StepProgress />
          <form.Step id="details">
            <Typography>Validating this step before continuing.</Typography>
          </form.Step>
          <form.Step id="review">
            <Typography>Review the validated details.</Typography>
          </form.Step>
          <form.Actions>
            <form.NextStepButton loading>Validating details</form.NextStepButton>
          </form.Actions>
        </form.MultiStep>
      </form.Form>
    </VireoStorybookProvider>
  );
}
