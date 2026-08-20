import { Button, Stack, type ButtonProps } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const RoundedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(function RoundedButton(props, ref) {
  return <Button {...props} ref={ref} />;
});

export default function CustomizedSlotsExample() {
  const form = useVireoForm({ defaultValues: { workspace: "Atlas" } });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field name="workspace">
            {field => (
              <VireoLabelBox label="Workspace">
                <field.TextField slotProps={{ htmlInput: { "aria-label": "Workspace" } }} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.ResetButton
            slots={{ root: RoundedButton }}
            slotProps={{
              root: ownerState => ({
                "data-pristine": ownerState.pristine,
                sx: { borderRadius: 999, letterSpacing: "0.08em" },
              }),
            }}
            variant="outlined"
          >
            Restore defaults
          </form.ResetButton>
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
