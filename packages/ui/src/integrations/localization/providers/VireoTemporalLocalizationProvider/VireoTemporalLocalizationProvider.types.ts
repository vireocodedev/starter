import type { AdapterFormats } from "@mui/x-date-pickers/models";
import type { PickersInputLocaleText } from "@mui/x-date-pickers/locales";
import type { Dayjs } from "dayjs";
import type React from "react";

export const VIREO_TEMPORAL_BASE_LOCALES = ["en", "hr"] as const;

export type VireoTemporalBaseLocale = (typeof VIREO_TEMPORAL_BASE_LOCALES)[number];

/** Known built-in locales plus consumer-registered Day.js locale identifiers. */
export type VireoTemporalLocale = VireoTemporalBaseLocale | (string & {});

export type VireoTemporalLocalizationProviderProps = {
  /** Optional Day.js locale override when the semantic locale uses another identifier. */
  adapterLocale?: string;
  children: React.ReactNode;
  /** Overrides adapter formats for every picker inside this provider scope. */
  dateFormats?: Partial<AdapterFormats>;
  /** Semantic application locale. English and Croatian are available without extra imports. */
  locale: VireoTemporalLocale;
  /** Overrides the bundled English or Croatian MUI picker text. */
  localeText?: PickersInputLocaleText<Dayjs>;
};
