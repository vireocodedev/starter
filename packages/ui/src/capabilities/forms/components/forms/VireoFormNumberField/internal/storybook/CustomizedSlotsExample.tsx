import { FormControl, type FormControlProps } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
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
      <form.Form>
        <form.Section label="Budget" variant="plain" layout="stack">
          <form.Field name="budget">
            {field => (
              <VireoLabelBox label="Monthly budget">
                <field.NumberField
                  helperText="Edit the budget to see the root-slot accent change."
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
                    htmlInput: { "aria-label": "Monthly budget", "data-analytics-field": "monthly-budget" },
                  }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.ResetButton variant="outlined">Reset</form.ResetButton>
          </form.Actions>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
