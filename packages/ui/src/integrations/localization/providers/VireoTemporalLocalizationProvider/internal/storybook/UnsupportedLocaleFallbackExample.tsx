import { VireoTemporalLocalizationProvider } from "@vireocodedev/starter-ui/localization";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Alert, Stack } from "@mui/material";
import { DateField } from "@mui/x-date-pickers/DateField";
import dayjs from "dayjs";

export default function UnsupportedLocaleFallbackExample() {
  return (
    <VireoStorybookProvider>
      <VireoTemporalLocalizationProvider locale="zz-ZZ">
        <Stack spacing={2} sx={{ maxWidth: 420 }}>
          <Alert severity="info">The unavailable locale falls back to English without hiding its children.</Alert>
          <DateField label="Fallback date" value={dayjs("2026-08-25")} />
        </Stack>
      </VireoTemporalLocalizationProvider>
    </VireoStorybookProvider>
  );
}
