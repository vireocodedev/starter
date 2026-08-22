import { useVireoSearchParamState, vireoSearchParamCodecs } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, FormControlLabel, Stack, Switch, Typography } from "@mui/material";

export default function BuiltInCodecsExample() {
  const [page, setPage] = useVireoSearchParamState("vireo-hook-page", {
    defaultValue: 1,
    codec: vireoSearchParamCodecs.number,
  });
  const [compact, setCompact] = useVireoSearchParamState("vireo-hook-compact", {
    defaultValue: false,
    codec: vireoSearchParamCodecs.boolean,
  });

  return (
    <VireoStorybookProvider>
      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <Typography variant="h6">Results view</Typography>
        <Stack alignItems="center" direction="row" spacing={1}>
          <Button disabled={page <= 1} onClick={() => setPage(current => current - 1)}>
            Previous page
          </Button>
          <Typography>Page {page}</Typography>
          <Button onClick={() => setPage(current => current + 1)}>Next page</Button>
        </Stack>
        <FormControlLabel
          control={<Switch checked={compact} onChange={event => setCompact(event.target.checked)} />}
          label="Compact rows"
        />
      </Stack>
    </VireoStorybookProvider>
  );
}
