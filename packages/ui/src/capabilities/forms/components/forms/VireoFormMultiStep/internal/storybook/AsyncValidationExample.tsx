import { Stack, Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoMultiStepForm } from "@vireocodedev/ui/forms";

export default function AsyncValidationExample() {
  const form = useVireoMultiStepForm({
    defaultValues: { workspace: "vireo" },
    onSubmit: () => undefined,
    steps: [
      { id: "workspace", label: "Workspace", fields: ["workspace"] },
      { id: "review", label: "Review" },
    ],
  });
  return (
    <form.Form>
      <form.MultiStep>
        <Stack spacing={2}>
          <form.StepProgress />
          <form.Step id="workspace">
            <form.Field
              name="workspace"
              asyncDebounceMs={300}
              validators={{
                onSubmitAsync: async ({ value }) => {
                  await new Promise(resolve => setTimeout(resolve, 500));
                  return value.toLowerCase() === "reserved" ? "That workspace is reserved." : undefined;
                },
              }}
            >
              {field => (
                <VireoLabelBox label="Workspace" required>
                  <field.TextField slotProps={{ htmlInput: { "aria-label": "Workspace" } }} />
                </VireoLabelBox>
              )}
            </form.Field>
          </form.Step>
          <form.Step id="review">
            <Typography>Async availability validation completed.</Typography>
          </form.Step>
          <form.Actions>
            <form.PreviousStepButton />
            <form.NextStepButton />
            <form.SubmitButton>Provision</form.SubmitButton>
          </form.Actions>
        </Stack>
      </form.MultiStep>
    </form.Form>
  );
}
