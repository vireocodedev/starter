import { VireoToaster, toast } from "@vireocodedev/starter-ui/sonner";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Stack, Typography } from "@mui/material";

export default function ScopedToasterExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={2} alignItems="flex-start" sx={{ minHeight: 480, width: "100%" }}>
        <Typography variant="h6">Explicitly routed notification regions</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => toast.info("Workspace notification", { toasterId: "workspace" })}>
            Notify workspace
          </Button>
          <Button variant="outlined" onClick={() => toast.warning("Admin attention required", { toasterId: "admin" })}>
            Notify admin
          </Button>
        </Stack>
        <VireoToaster id="workspace" position="bottom-left" />
        <VireoToaster id="admin" position="bottom-right" />
      </Stack>
    </VireoStorybookProvider>
  );
}
