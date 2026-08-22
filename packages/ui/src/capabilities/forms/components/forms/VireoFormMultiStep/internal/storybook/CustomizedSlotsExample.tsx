import { Paper, Stack, Typography } from "@mui/material";
import { useVireoMultiStepForm } from "@vireocodedev/starter-ui/forms";
import React from "react";

const ProgressSurface = React.forwardRef<HTMLElement, React.ComponentProps<typeof Paper>>(
  function ProgressSurface(props, ref) {
    return <Paper {...props} ref={ref} component="nav" variant="outlined" />;
  },
);

export default function CustomizedSlotsExample() {
  const form = useVireoMultiStepForm({
    defaultValues: {},
    onSubmit: () => undefined,
    steps: [
      { id: "compose", label: "Compose" },
      { id: "publish", label: "Publish" },
    ],
  });
  return (
    <form.Form>
      <form.MultiStep slotProps={{ root: { sx: { p: 2, border: 1, borderColor: "divider", borderRadius: 2 } } }}>
        <Stack spacing={2}>
          <form.StepProgress
            slots={{ root: ProgressSurface }}
            slotProps={{
              root: { sx: { p: 2 } },
              statusIcon: ({ step }) => ({ "data-status": step?.status ?? "inactive" }),
            }}
          />
          <form.Step id="compose">
            <Typography>Compose content.</Typography>
          </form.Step>
          <form.Step id="publish">
            <Typography>Publish content.</Typography>
          </form.Step>
          <form.Actions>
            <form.PreviousStepButton />
            <form.NextStepButton />
            <form.SubmitButton>Publish</form.SubmitButton>
          </form.Actions>
        </Stack>
      </form.MultiStep>
    </form.Form>
  );
}
