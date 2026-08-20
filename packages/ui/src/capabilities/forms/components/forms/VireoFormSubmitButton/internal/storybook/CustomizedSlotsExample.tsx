import { Button, type ButtonProps } from "@mui/material";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const RoundedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(function RoundedButton(props, ref) {
  return <Button {...props} ref={ref} />;
});

export default function CustomizedSlotsExample() {
  const form = useVireoForm({
    defaultValues: {},
    onSubmit: async () => new Promise(resolve => setTimeout(resolve, 1200)),
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <form.SubmitButton
          variant="outlined"
          slots={{ root: RoundedButton }}
          slotProps={{
            root: ownerState => ({
              "data-submitting": ownerState.submitting,
              sx: { borderRadius: 999, letterSpacing: "0.08em" },
            }),
          }}
        >
          Publish release
        </form.SubmitButton>
      </form.Form>
    </VireoStorybookProvider>
  );
}
