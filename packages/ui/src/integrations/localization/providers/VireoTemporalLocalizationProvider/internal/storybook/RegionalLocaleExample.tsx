import { VireoTemporalLocalizationProvider } from "@vireocodedev/starter-ui/localization";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { DateField } from "@mui/x-date-pickers/DateField";
import dayjs from "dayjs";

export default function RegionalLocaleExample() {
  return (
    <VireoStorybookProvider>
      <VireoTemporalLocalizationProvider locale="hr-HR">
        <DateField label="Regionalni datum" value={dayjs("2026-12-31")} />
      </VireoTemporalLocalizationProvider>
    </VireoStorybookProvider>
  );
}
