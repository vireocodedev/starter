import { type RGO_LOCALE_NAMESPACE } from "@/setup/config/RgoLocale";
import type EnglishTranslations from "@/setup/translations/translation.en";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      [RGO_LOCALE_NAMESPACE]: typeof EnglishTranslations;
    };
  }
}
