import { RGO_LOCALE_TO_DAYJS_LOCALE } from "@/setup/config/RgoLocale";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { useTranslation } from "react-i18next";
import type React from "react";
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

export function RgoLocalizationProvider({ children }: React.PropsWithChildren) {
  const { ready, i18n } = useTranslation();

  if (!ready) {
    return <></>;
  }

  const adapterLocale = RGO_LOCALE_TO_DAYJS_LOCALE[i18n.language as RgoLocale];

  return (
    <LocalizationProvider adapterLocale={adapterLocale} dateAdapter={AdapterDayjs}>
      {children}
    </LocalizationProvider>
  );
}
