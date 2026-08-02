import { type RgoNationality } from "@/features/i18next";
import { type TFunction } from "i18next";
import { z } from "zod";

/**
 * RgoLocale represents the supported locales for the RGO application.
 * It is defined as a Zod enum to ensure type safety and validation throughout the application.
 * The supported locales include:
 */
export const RgoLocale = z.enum([
  "bs", // Bosnian
  "cnr", // Montenegrin
  "de", // German
  "en", // English
  "hr", // Croatian
  "it", // Italian
  "pt", // Portuguese
  "sl", // Slovenian
]);

export type RgoLocale = z.infer<typeof RgoLocale>;

/**
 * RGO_LOCALE_NAMESPACE is the namespace used for translations related to the RGO UI components. It helps to organize translation keys and avoid conflicts with other namespaces in the i18n setup.
 */
export const RGO_LOCALE_NAMESPACE = "rgo-ui";

/**
 * RgoTranslationFn is a type that represents the translation function for the RGO UI namespace. It is defined using the TFunction type from i18next, with the RGO_LOCALE_NAMESPACE as the namespace parameter.
 * This type ensures that when using the translation function in the RGO UI components, the correct namespace is enforced, providing type safety and better developer experience when accessing translations.
 */
export type RgoTranslationFn = TFunction<typeof RGO_LOCALE_NAMESPACE>;

/**
 * RGO_LOCALE_TO_TRANSLATED_LABEL maps each supported locale to its translated label in the respective language.
 * This is used for displaying the name of the language in the user interface, such as in language selection dropdowns or settings.
 */
export const RGO_LOCALE_TO_TRANSLATED_LABEL = {
  en: "English",
  hr: "Hrvatski",
  bs: "Bosanski",
  cnr: "Crnogorski",
  it: "Italiano",
  pt: "Português",
  sl: "Slovenščina",
  de: "Deutsch",
} as const satisfies Record<RgoLocale, string>;

/**
 * RGO_LOCALE_TO_NATIONALITY_CODE maps each supported locale to its corresponding nationality code, which can be used for displaying flags or other locale-specific icons.
 * This mapping is essential for providing a visual representation of the selected language in the user interface.
 */
export const RGO_LOCALE_TO_NATIONALITY_CODE = {
  en: "US",
  hr: "HR",
  bs: "BA",
  cnr: "ME",
  it: "IT",
  pt: "PT",
  sl: "SI",
  de: "DE",
} as const satisfies Record<RgoLocale, RgoNationality>;

/**
 * RGO_LOCALE_TO_DAYJS_LOCALE maps each supported RGO locale to the corresponding locale code used by the Day.js library for date and time formatting.
 * This mapping ensures that when a user selects a locale in the RGO application, the date and time formats will be correctly localized according to the conventions of that locale.
 */
export const RGO_LOCALE_TO_DAYJS_LOCALE = {
  en: "en",
  hr: "hr",
  bs: "bs",
  cnr: "me",
  it: "it",
  pt: "pt",
  sl: "sl",
  de: "de",
} as const satisfies Record<RgoLocale, string>;
