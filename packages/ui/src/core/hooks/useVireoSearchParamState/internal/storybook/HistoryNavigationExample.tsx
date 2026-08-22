import { useVireoSearchParamState } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Stack, Typography } from "@mui/material";

export default function HistoryNavigationExample() {
  const [view, setView] = useVireoSearchParamState("vireo-hook-history", {
    defaultValue: "summary",
    history: "push",
  });

  return (
    <VireoStorybookProvider>
      <Stack spacing={2} sx={{ maxWidth: 560 }}>
        <Typography variant="h6">Current view: {view}</Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {(["summary", "activity", "billing"] as const).map(value => (
            <Button key={value} variant={view === value ? "contained" : "outlined"} onClick={() => setView(value)}>
              {value}
            </Button>
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button onClick={() => window.history.back()}>Browser back</Button>
          <Button onClick={() => window.history.forward()}>Browser forward</Button>
        </Stack>
        <Typography color="text.secondary">
          Select two or more views, then use browser back and forward to revisit them.
        </Typography>
      </Stack>
    </VireoStorybookProvider>
  );
}
