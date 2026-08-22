import { VireoTemporalLocalizationProvider } from "@vireocodedev/starter-ui/localization";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

export default function CustomFormatsAndLocaleTextExample() {
  return (
    <VireoStorybookProvider>
      <VireoTemporalLocalizationProvider
        locale="en"
        dateFormats={{ keyboardDate: "YYYY / MM / DD" }}
        localeText={{ fieldClearLabel: "Remove schedule date", todayButtonLabel: "Use today" }}
      >
        <DatePicker
          label="Schedule date"
          value={dayjs("2026-08-25")}
          slotProps={{ actionBar: { actions: ["today"] } }}
        />
      </VireoTemporalLocalizationProvider>
    </VireoStorybookProvider>
  );
}
