import { VireoToaster, toast } from "@vireocodedev/starter-ui/sonner";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Stack, Typography } from "@mui/material";

const toasterId = "stacking";

export default function StackingExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h6">Compact three-toast stack</Typography>
        <Button
          variant="outlined"
          onClick={() => {
            for (let number = 1; number <= 5; number += 1) {
              toast.info(`Background task ${number} completed`, { toasterId });
            }
          }}
        >
          Complete five tasks
        </Button>
        <VireoToaster id={toasterId} />
      </Stack>
    </VireoStorybookProvider>
  );
}
