import { VireoToaster, toast } from "@vireocodedev/starter-ui/sonner";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Stack, Typography } from "@mui/material";

const toasterId = "actions-and-dismissal";

export default function ActionsAndDismissalExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h6">One concise recovery action</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() =>
              toast("Draft archived", {
                toasterId,
                description: "The draft remains recoverable for this session.",
                duration: 8000,
                action: { label: "Undo", onClick: () => toast.success("Draft restored", { toasterId }) },
                cancel: { label: "Dismiss", onClick: () => undefined },
              })
            }
          >
            Archive draft
          </Button>
          <Button variant="text" onClick={() => toast.dismiss()}>
            Dismiss all
          </Button>
        </Stack>
        <VireoToaster id={toasterId} />
      </Stack>
    </VireoStorybookProvider>
  );
}
