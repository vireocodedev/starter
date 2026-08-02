import { RgoInitializeProvider } from "@/providers/RgoInitializeProvider/RgoInitializeProvider";
import { type RgoProvider } from "@/providers/RgoProviders";
import { RGO_LOCALE_TO_DAYJS_LOCALE } from "@/setup/config/RgoLocale";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { useTranslation } from "react-i18next";
import "./RgoLocalizationProvider.css";

import "dayjs/locale/bs";
import "dayjs/locale/de";
import "dayjs/locale/en";
import "dayjs/locale/hr";
import "dayjs/locale/it";
import "dayjs/locale/me";
import "dayjs/locale/pt";
import "dayjs/locale/sl";

import { type RgoLocale } from "@/setup/config/RgoLocale";
import countries from "i18n-iso-countries";
import bsCountries from "i18n-iso-countries/langs/bs.json";
import deCountries from "i18n-iso-countries/langs/de.json";
import enCountries from "i18n-iso-countries/langs/en.json";
import hrCountries from "i18n-iso-countries/langs/hr.json";
import itCountries from "i18n-iso-countries/langs/it.json";
import ptCountries from "i18n-iso-countries/langs/pt.json";
import slCountries from "i18n-iso-countries/langs/sl.json";

function onInit() {
  countries.registerLocale(bsCountries);
  countries.registerLocale(deCountries);
  countries.registerLocale(enCountries);
  countries.registerLocale(hrCountries);
  countries.registerLocale(itCountries);
  countries.registerLocale(ptCountries);
  countries.registerLocale(slCountries);
}

export const RgoLocalizationProvider: RgoProvider = ({ children }) => {
  const { ready, i18n } = useTranslation();

  if (!ready) {
    return <></>;
  }

  const adapterLocale = RGO_LOCALE_TO_DAYJS_LOCALE[i18n.language as RgoLocale];

  return (
    <RgoInitializeProvider onInit={onInit}>
      <LocalizationProvider adapterLocale={adapterLocale} dateAdapter={AdapterDayjs}>
        {children}
      </LocalizationProvider>
    </RgoInitializeProvider>
  );
};
