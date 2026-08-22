import { VireoToaster, toast } from "@vireocodedev/starter-ui/sonner";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Stack, Typography } from "@mui/material";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={2} alignItems="flex-start" sx={{ minHeight: 480, width: "100%" }}>
        <Typography variant="h6">Workspace notifications</Typography>
        <Stack direction="row" useFlexGap flexWrap="wrap" gap={1}>
          <Button variant="outlined" onClick={() => toast("Background sync completed")}>
            Neutral
          </Button>
          <Button variant="outlined" color="success" onClick={() => toast.success("Customer saved")}>
            Success
          </Button>
          <Button variant="outlined" color="info" onClick={() => toast.info("A newer draft is available")}>
            Info
          </Button>
          <Button variant="outlined" color="warning" onClick={() => toast.warning("Two records need review")}>
            Warning
          </Button>
          <Button variant="outlined" color="error" onClick={() => toast.error("Customer could not be saved")}>
            Error
          </Button>
        </Stack>
        <VireoToaster />
      </Stack>
    </VireoStorybookProvider>
  );
}
