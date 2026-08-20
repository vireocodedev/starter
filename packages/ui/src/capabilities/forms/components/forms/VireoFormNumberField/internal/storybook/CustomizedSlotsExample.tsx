import { FormControl, Stack, type FormControlProps } from "@mui/material";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const AccentedFormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  function AccentedFormControl(props, ref) {
    return <FormControl {...props} ref={ref} />;
  },
);

export default function CustomizedSlotsExample() {
  const form = useVireoForm({
    defaultValues: { budget: 250 as number | null },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field name="budget">
            {field => (
              <field.NumberField
                helperText="Edit the budget to see the root-slot accent change."
                label="Monthly budget"
                min={0}
                slots={{ root: AccentedFormControl }}
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
                  htmlInput: { "data-analytics-field": "monthly-budget" },
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
