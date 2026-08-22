import { VireoToaster, toast } from "@vireocodedev/starter-ui/sonner";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Stack, Typography } from "@mui/material";

const toasterId = "responsive-defaults";

export default function ResponsiveDefaultsExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h6">Resize the viewport before opening the toast</Typography>
        <Typography color="text.secondary">
          Mobile uses top-center placement; desktop uses bottom-right placement.
        </Typography>
        <Button variant="outlined" onClick={() => toast.success("Responsive position resolved", { toasterId })}>
          Show responsive toast
        </Button>
        <VireoToaster id={toasterId} />
      </Stack>
    </VireoStorybookProvider>
  );
}
