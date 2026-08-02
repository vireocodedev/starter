import type i18nStatic from "i18next";
import { type InitOptions } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

export function configureI18nClient(i18n: typeof i18nStatic, initOptions: InitOptions = {}): void {
  i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      ...initOptions,
      ns: initOptions?.ns ?? ["translation"],
      defaultNS: initOptions?.ns ?? "translation",
      react: {
        useSuspense: false,
        ...(initOptions?.react ?? {}),
      },
      fallbackLng: initOptions?.fallbackLng ?? "en",
      interpolation: {
        escapeValue: false,
        ...(initOptions?.interpolation ?? {}),
      },
    });
}
