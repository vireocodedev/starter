import { Button, Paper, Stack, Typography } from "@mui/material";
import React from "react";

export const UseMutationBasicWithDefaultPropsDemo = () => {
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");

  const handleMutate = (succeed: boolean) => {
    setStatus("loading");
    setTimeout(() => {
      setStatus(succeed ? "success" : "error");
    }, 1000);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        Mutation Basic
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Wraps TanStack Query&apos;s <code>useMutation</code> with automatic snackbar notifications on success and error.
        This demo simulates the mutation lifecycle.
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="contained" size="small" disabled={status === "loading"} onClick={() => handleMutate(true)}>
          Simulate Success
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="error"
          disabled={status === "loading"}
          onClick={() => handleMutate(false)}
        >
          Simulate Error
        </Button>
      </Stack>

      <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
        Status: <strong>{status}</strong>
      </Typography>
    </Paper>
  );
};

export const UseMutationBasicWithDefaultPropsDemoCode = `import { useRgoMutation } from "@vireocodedev/starter-ui";

function SaveSettings() {
  const { mutate, isPending } = useRgoMutation({
    mutationFn: async (values: { name: string }) => {
      const res = await fetch("/api/settings", {
        method: "POST",
        body: JSON.stringify(values),
      });
      return res.json();
    },
    messageSuccess: "Settings saved successfully!",
    messageError: "Failed to save settings.",
  });

  return (
    <button disabled={isPending} onClick={() => mutate({ name: "New Name" })}>
      {isPending ? "Saving..." : "Save"}
    </button>
  );
}`;
