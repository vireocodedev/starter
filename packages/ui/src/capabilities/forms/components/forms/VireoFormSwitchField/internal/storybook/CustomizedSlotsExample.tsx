import { FormControl, Stack, Typography, type FormControlProps, type TypographyProps } from "@mui/material";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const AccentedFormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  function AccentedFormControl(props, ref) {
    return <FormControl {...props} ref={ref} />;
  },
);

const StrongLabel = React.forwardRef<HTMLElement, TypographyProps>(function StrongLabel(props, ref) {
  return <Typography {...props} ref={ref} fontWeight={700} />;
});

export default function CustomizedSlotsExample() {
  const form = useVireoForm({
    defaultValues: { automaticReports: false },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field name="automaticReports">
            {field => (
              <field.SwitchField
                helperText="Edit the value to see the root-slot accent change."
                label="Generate reports automatically"
                slots={{ label: StrongLabel, root: AccentedFormControl }}
                slotProps={{
                  root: ownerState => ({
                    "data-checked": ownerState.checked,
                    sx: {
                      position: "relative",
                      "&::before": {
                        borderInlineStart: "3px solid",
                        borderColor: ownerState.checked ? "success.main" : "primary.main",
                        borderRadius: 1,
                        content: '""',
                        insetBlock: 4,
                        insetInlineStart: -10,
                        position: "absolute",
                      },
                    },
                  }),
                  switch: { "data-analytics-field": "automatic-reports", color: "success" },
                }}
              />
            )}
          </form.Field>
          <form.ResetButton variant="outlined">Reset</form.ResetButton>
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
