import { VireoTemporalLocalizationProvider } from "@vireocodedev/starter-ui/localization";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { DateField } from "@mui/x-date-pickers/DateField";
import dayjs from "dayjs";
import "dayjs/locale/me";

export default function AdapterLocaleOverrideExample() {
  return (
    <VireoStorybookProvider>
      <VireoTemporalLocalizationProvider locale="cnr" adapterLocale="me">
        <DateField label="Datum pregleda" value={dayjs("2026-08-25")} />
      </VireoTemporalLocalizationProvider>
    </VireoStorybookProvider>
  );
}
