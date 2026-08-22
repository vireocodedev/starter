import { useVireoDebouncedCallback } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Stack, Typography } from "@mui/material";
import React from "react";

export default function CancelAndFlushExample() {
  const [status, setStatus] = React.useState("Nothing scheduled");
  const [pending, setPending] = React.useState(false);
  const publish = useVireoDebouncedCallback(
    (name: string) => {
      const message = `Published ${name}`;
      setStatus(message);
      setPending(false);
      return message;
    },
    { delayMs: 3000 },
  );

  return (
    <VireoStorybookProvider>
      <Stack spacing={2} width="100%" maxWidth={520}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="contained"
            onClick={() => {
              publish.run("quarterly report");
              setPending(publish.isPending());
              setStatus("Publication scheduled");
            }}
          >
            Schedule
          </Button>
          <Button
            onClick={() => {
              publish.cancel();
              setPending(publish.isPending());
              setStatus("Publication cancelled");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              const result = publish.flush();
              setPending(publish.isPending());
              if (result === undefined) setStatus("Nothing to flush");
            }}
          >
            Flush now
          </Button>
        </Stack>
        <Typography>Status: {status}</Typography>
        <Typography color="text.secondary">Pending: {pending ? "Yes" : "No"}</Typography>
      </Stack>
    </VireoStorybookProvider>
  );
}
