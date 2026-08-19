import { Button, FormControl, Stack, type FormControlProps } from "@mui/material";
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
              <field.TextField
                label="Workspace"
                slots={{ root: BorderedFormControl }}
                slotProps={{
                  root: ownerState => ({
                    "data-dirty": ownerState.dirty,
                    sx: {
                      borderInlineStart: 3,
                      borderColor: ownerState.dirty ? "warning.main" : "primary.main",
                      pl: 2,
                    },
                  }),
                  htmlInput: { "data-analytics-field": "workspace" },
                  inputLabel: { shrink: true },
                }}
              />
            )}
          </form.Field>
          <Button type="reset" variant="outlined">
            Reset
          </Button>
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
