import { VireoLabelBox, useVireoSearchParamState } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Button, Stack, TextField, Typography } from "@mui/material";

export default function DefaultStringExample() {
  const [query, setQuery] = useVireoSearchParamState("vireo-hook-query", {
    defaultValue: "",
  });

  return (
    <VireoStorybookProvider>
      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <Typography variant="h6">Customer search</Typography>
        <VireoLabelBox label="Search query">
          <TextField
            value={query}
            onChange={event => setQuery(event.target.value)}
            slotProps={{ htmlInput: { "aria-label": "Search query" } }}
          />
        </VireoLabelBox>
        <Stack direction="row" spacing={1}>
          <Button onClick={() => setQuery(current => `${current} priority`.trim())}>Append priority</Button>
          <Button disabled={query === ""} onClick={() => setQuery("")}>
            Clear
          </Button>
        </Stack>
        <Typography color="text.secondary">Current value: {query === "" ? "Default (empty)" : query}</Typography>
      </Stack>
    </VireoStorybookProvider>
  );
}
