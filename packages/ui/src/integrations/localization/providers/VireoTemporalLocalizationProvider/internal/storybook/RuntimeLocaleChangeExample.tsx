import { VireoTemporalLocalizationProvider, type VireoTemporalLocale } from "@vireocodedev/starter-ui/localization";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Stack, Typography } from "@mui/material";
import { DateField } from "@mui/x-date-pickers/DateField";
import dayjs from "dayjs";
import React from "react";

export default function RuntimeLocaleChangeExample() {
  const [locale, setLocale] = React.useState<VireoTemporalLocale>("en");
  const [note, setNote] = React.useState("This text survives locale changes.");

  return (
    <VireoStorybookProvider>
      <VireoTemporalLocalizationProvider locale={locale}>
        <Stack spacing={2} maxWidth={420}>
          <Typography>Active locale: {locale}</Typography>
          <DateField label="Review date" value={dayjs("2026-08-25")} />
          <input aria-label="Persistent note" value={note} onChange={event => setNote(event.target.value)} />
          <Button onClick={() => setLocale(current => (current === "en" ? "hr" : "en"))}>Change locale</Button>
        </Stack>
      </VireoTemporalLocalizationProvider>
    </VireoStorybookProvider>
  );
}
