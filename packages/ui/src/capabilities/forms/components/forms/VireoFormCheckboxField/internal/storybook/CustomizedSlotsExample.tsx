import { FormControl, Typography, type FormControlProps, type TypographyProps } from "@mui/material";
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
    defaultValues: { includeAttachments: false },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Checkbox example" variant="plain" layout="stack">
          <form.Field name="includeAttachments">
            {field => (
              <field.CheckboxField
                helperText="Edit the value to see the root-slot accent change."
                label="Include file attachments"
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
                  checkbox: { "data-analytics-field": "include-attachments", color: "success" },
                }}
              />
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
