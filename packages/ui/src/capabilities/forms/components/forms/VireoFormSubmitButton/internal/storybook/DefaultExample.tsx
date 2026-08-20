import { Stack } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function DefaultExample() {
  const form = useVireoForm({
    defaultValues: { projectName: "Northstar" },
    onSubmit: async () => new Promise(resolve => setTimeout(resolve, 1200)),
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field name="projectName">
            {field => (
              <VireoLabelBox label="Project name">
                <field.TextField slotProps={{ htmlInput: { "aria-label": "Project name" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.SubmitButton variant="contained">Save project</form.SubmitButton>
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
