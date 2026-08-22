import { VireoTemporalLocalizationProvider } from "@vireocodedev/starter-ui/localization";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Paper, Stack, Typography } from "@mui/material";
import { DateField } from "@mui/x-date-pickers/DateField";
import dayjs from "dayjs";

export default function NestedLocalesExample() {
  return (
    <VireoStorybookProvider>
      <VireoTemporalLocalizationProvider locale="en">
        <Stack spacing={2} maxWidth={520}>
          <Typography>Outer English scope</Typography>
          <DateField label="Review date" value={dayjs("2026-08-25")} />
          <VireoTemporalLocalizationProvider locale="hr">
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Typography>Nested Croatian scope</Typography>
                <DateField label="Datum pregleda" value={dayjs("2026-08-25")} />
              </Stack>
            </Paper>
          </VireoTemporalLocalizationProvider>
        </Stack>
      </VireoTemporalLocalizationProvider>
    </VireoStorybookProvider>
  );
}
