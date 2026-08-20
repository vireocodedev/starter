import { FormControl, Stack, type FormControlProps } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const BorderedFormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  function BorderedFormControl(props, ref) {
    return <FormControl {...props} ref={ref} />;
  },
);

export default function CustomizedSlotsExample() {
  const form = useVireoForm({
    defaultValues: { workspace: "Atlas" },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field name="workspace">
            {field => (
              <VireoLabelBox label="Workspace">
                <field.TextField
                  helperText="Edit the value to see the root-slot accent change."
                  slots={{ root: BorderedFormControl }}
                  slotProps={{
                    root: ownerState => ({
                      "data-dirty": ownerState.dirty,
                      sx: {
                        position: "relative",
                        "&::before": {
                          borderInlineStart: "3px solid",
                          borderColor: ownerState.dirty ? "warning.main" : "primary.main",
                          borderRadius: 1,
                          content: '""',
                          insetBlock: 4,
                          insetInlineStart: -10,
                          position: "absolute",
                        },
                      },
                    }),
                    htmlInput: { "aria-label": "Workspace", "data-analytics-field": "workspace" },
                  }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.ResetButton variant="outlined">Reset</form.ResetButton>
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
