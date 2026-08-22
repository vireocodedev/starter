import { Stack, ThemeProvider, Typography, createTheme, type Theme } from "@mui/material";
import { useVireoMultiStepForm } from "@vireocodedev/starter-ui/forms";

function createWorkflowTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormMultiStep: {
        styleOverrides: {
          root: { border: `1px solid ${outerTheme.palette.secondary.main}`, borderRadius: 12, padding: 20 },
        },
      },
      VireoFormStepProgress: {
        defaultProps: { navigation: "all" },
        styleOverrides: { statusIcon: { backgroundColor: outerTheme.palette.secondary.main } },
      },
      VireoFormNextStepButton: { defaultProps: { color: "secondary" } },
    },
  });
}

export default function ThemeCustomizationExample() {
  const form = useVireoMultiStepForm({
    defaultValues: {},
    onSubmit: () => undefined,
    steps: [
      { id: "draft", label: "Draft" },
      { id: "review", label: "Review" },
    ],
  });
  return (
    <ThemeProvider theme={createWorkflowTheme}>
      <form.Form>
        <form.MultiStep>
          <Stack spacing={2}>
            <form.StepProgress />
            <form.Step id="draft">
              <Typography>The theme owns the workflow accent.</Typography>
            </form.Step>
            <form.Step id="review">
              <Typography>Review</Typography>
            </form.Step>
            <form.Actions>
              <form.PreviousStepButton />
              <form.NextStepButton />
              <form.SubmitButton color="secondary">Approve</form.SubmitButton>
            </form.Actions>
          </Stack>
        </form.MultiStep>
      </form.Form>
    </ThemeProvider>
  );
}
