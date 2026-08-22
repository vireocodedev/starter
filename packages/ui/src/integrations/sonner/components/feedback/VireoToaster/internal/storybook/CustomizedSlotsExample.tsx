import { VireoToaster, toast, type SonnerToasterProps } from "@vireocodedev/starter-ui/sonner";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Stack, Typography } from "@mui/material";
import React from "react";
import { Toaster } from "sonner";

const toasterId = "customized-slots";

const InstrumentedToaster = React.forwardRef<HTMLElement, SonnerToasterProps & { sonnerTheme?: "light" | "dark" }>(
  function InstrumentedToaster({ containerAriaLabel, sonnerTheme, ...props }, ref) {
    return (
      <Toaster
        {...props}
        ref={ref}
        theme={sonnerTheme}
        containerAriaLabel={`Audit channel: ${containerAriaLabel ?? "Notifications"}`}
      />
    );
  },
);

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h6">Instrumented notification region</Typography>
        <Button variant="outlined" onClick={() => toast.success("Audit event recorded", { toasterId })}>
          Record audit event
        </Button>
        <VireoToaster
          id={toasterId}
          slots={{ root: InstrumentedToaster }}
          slotProps={{ root: { sx: { "& [data-sonner-toast]": { minWidth: 380 } } } }}
        />
      </Stack>
    </VireoStorybookProvider>
  );
}
