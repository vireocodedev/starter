import { useVireoDebouncedCallback, VireoLabelBox } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Stack, TextField, Typography } from "@mui/material";
import React from "react";

export default function DefaultExample() {
  const [draft, setDraft] = React.useState("");
  const [committed, setCommitted] = React.useState("");
  const search = useVireoDebouncedCallback(setCommitted, { delayMs: 500 });

  return (
    <VireoStorybookProvider>
      <Stack
        spacing={2}
        sx={{
          maxWidth: 520,
          width: "100%",
        }}
      >
        <VireoLabelBox label="Search query">
          <TextField
            value={draft}
            placeholder="Type to debounce the update"
            slotProps={{ htmlInput: { "aria-label": "Search query" } }}
            onChange={event => {
              const value = event.target.value;
              setDraft(value);
              search.run(value);
            }}
          />
        </VireoLabelBox>
        <Typography>Immediate value: {draft || "Empty"}</Typography>
        <Typography color="text.secondary">Debounced value: {committed || "Empty"}</Typography>
      </Stack>
    </VireoStorybookProvider>
  );
}
