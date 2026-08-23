import { VireoToaster, toast } from "@vireocodedev/starter-ui/sonner";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Stack, Typography } from "@mui/material";

const toasterId = "promise-lifecycle";

function publishRelease() {
  return new Promise<string>(resolve => window.setTimeout(() => resolve("2026.08"), 900));
}

export default function PromiseLifecycleExample() {
  return (
    <VireoStorybookProvider>
      <Stack
        spacing={2}
        sx={{
          alignItems: "flex-start",
          minHeight: 480,
          width: "100%",
        }}
      >
        <Typography variant="h6">One notification follows the complete operation</Typography>
        <Button
          variant="outlined"
          onClick={() =>
            toast.promise(publishRelease(), {
              toasterId,
              loading: "Publishing release…",
              success: version => `Release ${version} published`,
              error: "Release could not be published",
            })
          }
        >
          Publish release
        </Button>
        <VireoToaster id={toasterId} />
      </Stack>
    </VireoStorybookProvider>
  );
}
