import { Stack, Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoMultiStepForm } from "@vireocodedev/ui/forms";

export default function KeepMountedExample() {
  const form = useVireoMultiStepForm({
    defaultValues: { notes: "Draft survives step changes" },
    onSubmit: () => undefined,
    steps: [
      { id: "editor", label: "Editor", fields: ["notes"] },
      { id: "preview", label: "Preview" },
    ],
  });
  return (
    <form.Form>
      <form.MultiStep keepMounted>
        <Stack spacing={2}>
          <form.StepProgress />
          <form.Step id="editor">
            <form.Field name="notes">
              {field => (
                <VireoLabelBox label="Notes">
                  <field.TextField multiline minRows={3} slotProps={{ htmlInput: { "aria-label": "Notes" } }} />
                </VireoLabelBox>
              )}
            </form.Field>
          </form.Step>
          <form.Step id="preview">
            <Typography>Inactive step content remains mounted and hidden.</Typography>
          </form.Step>
          <form.Actions>
            <form.PreviousStepButton />
            <form.NextStepButton />
            <form.SubmitButton>Save draft</form.SubmitButton>
          </form.Actions>
        </Stack>
      </form.MultiStep>
    </form.Form>
  );
}
