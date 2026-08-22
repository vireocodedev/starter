import { VireoTemporalLocalizationProvider } from "@vireocodedev/starter-ui/localization";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { DateField } from "@mui/x-date-pickers/DateField";
import dayjs from "dayjs";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoTemporalLocalizationProvider locale="en">
        <DateField label="Review date" value={dayjs("2026-08-25")} />
      </VireoTemporalLocalizationProvider>
    </VireoStorybookProvider>
  );
}
