import { VireoStopwatch } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Paper, Stack, Typography } from "@mui/material";

const durations = [
  { label: "Short operation", seconds: 125 },
  { label: "Long operation", seconds: 2 * 60 * 60 + 2 * 60 + 3 },
  { label: "Multi-day operation", seconds: 2 * 24 * 60 * 60 + 3 * 60 * 60 + 30 * 60 },
  { label: "Calendar-scale operation", seconds: 365 * 24 * 60 * 60 + 2 * 30 * 24 * 60 * 60 + 7 * 24 * 60 * 60 },
];

export default function DurationFormatsExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={1.5}>
        {durations.map(duration => (
          <Paper
            key={duration.label}
            variant="outlined"
            sx={{ display: "flex", justifyContent: "space-between", gap: 3, p: 2 }}
          >
            <Typography color="text.secondary">{duration.label}</Typography>
            <VireoStopwatch startDate={0} endDate={duration.seconds * 1_000} label={duration.label} />
          </Paper>
        ))}
      </Stack>
    </VireoStorybookProvider>
  );
}
