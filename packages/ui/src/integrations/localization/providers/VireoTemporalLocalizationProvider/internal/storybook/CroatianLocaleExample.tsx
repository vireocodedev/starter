import { VireoTemporalLocalizationProvider } from "@vireocodedev/ui/localization";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

export default function CroatianLocaleExample() {
  return (
    <VireoStorybookProvider>
      <VireoTemporalLocalizationProvider locale="hr">
        <DatePicker label="Datum isporuke" value={dayjs("2026-08-25")} />
      </VireoTemporalLocalizationProvider>
    </VireoStorybookProvider>
  );
}
