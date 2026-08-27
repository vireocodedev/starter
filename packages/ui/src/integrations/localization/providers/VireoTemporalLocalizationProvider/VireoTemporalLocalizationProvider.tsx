"use client";

import "@/integrations/localization/services/dayjsSetup";
import {
  resolveVireoAdapterLocale,
  resolveVireoPickerTextLocale,
} from "@/integrations/localization/utils/localeResolver";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { enUS, hrHR } from "@mui/x-date-pickers/locales";
import React from "react";
import type { VireoTemporalLocalizationProviderProps } from "./VireoTemporalLocalizationProvider.types";

const VIREO_TEMPORAL_ADAPTER_MARKER = Symbol.for("@vireocodedev/ui/VireoTemporalLocalizationProvider");

class VireoAdapterDayjs extends AdapterDayjs {
  readonly [VIREO_TEMPORAL_ADAPTER_MARKER] = true;
}

const BUNDLED_LOCALE_TEXT = {
  en: enUS.components.MuiLocalizationProvider.defaultProps.localeText,
  hr: hrHR.components.MuiLocalizationProvider.defaultProps.localeText,
} as const;

/** Provides an explicit, scoped Day.js and MUI X localization boundary for Vireo temporal fields. */
export function VireoTemporalLocalizationProvider({
  adapterLocale,
  children,
  dateFormats,
  locale,
  localeText,
}: VireoTemporalLocalizationProviderProps) {
  const resolvedAdapterLocale = resolveVireoAdapterLocale(locale, adapterLocale);
  const bundledLocaleText = BUNDLED_LOCALE_TEXT[resolveVireoPickerTextLocale(locale)];
  const resolvedLocaleText = React.useMemo(
    () => ({
      ...bundledLocaleText,
      ...localeText,
    }),
    [bundledLocaleText, localeText],
  );

  return (
    <LocalizationProvider
      adapterLocale={resolvedAdapterLocale}
      dateAdapter={VireoAdapterDayjs}
      dateFormats={dateFormats}
      localeText={resolvedLocaleText}
    >
      {children}
    </LocalizationProvider>
  );
}
