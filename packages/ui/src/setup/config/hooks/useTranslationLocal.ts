import { RGO_LOCALE_NAMESPACE } from "@/setup/config/RgoLocale";
import rgoUiTranslations from "@/setup/translations";
import i18n from "i18next";
import { useTranslation } from "react-i18next";

let registered = false;

function ensureResourcesRegistered() {
  if (registered) return;
  for (const [locale, namespaces] of Object.entries(rgoUiTranslations)) {
    const resources = namespaces[RGO_LOCALE_NAMESPACE];
    i18n.addResourceBundle(locale, RGO_LOCALE_NAMESPACE, resources, true, true);
  }
  registered = true;
}

export function useTranslationLocal() {
  ensureResourcesRegistered();
  const { t } = useTranslation(RGO_LOCALE_NAMESPACE);
  return t;
}
