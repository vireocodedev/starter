import { createStarterResources, STARTER_TRANSLATION_NAMESPACES } from "@vireocodedev/starter-localization";
import { createInstance } from "i18next";

const APP_LOCALES = ["en", "hr"] as const;
const APP_TRANSLATION_NAMESPACE = "app";

const appTranslations = {
  en: { home: { introduction: "Welcome to the application." } },
  hr: { home: { introduction: "Dobro došli u aplikaciju." } },
} as const;

export async function runPrimaryWorkflowExample() {
  const starterResources = createStarterResources({ locales: APP_LOCALES });
  const resources = {
    en: { [APP_TRANSLATION_NAMESPACE]: appTranslations.en, ...starterResources.en },
    hr: { [APP_TRANSLATION_NAMESPACE]: appTranslations.hr, ...starterResources.hr },
  };

  const i18n = createInstance();
  await i18n.init({
    defaultNS: APP_TRANSLATION_NAMESPACE,
    fallbackLng: "en",
    initAsync: false,
    lng: "hr",
    ns: [APP_TRANSLATION_NAMESPACE, ...STARTER_TRANSLATION_NAMESPACES],
    resources,
  });

  return {
    appOwned: i18n.t("home.introduction"),
    namespaces: i18n.options.ns,
    starterOwned: i18n.t("common.cancel", { ns: "platform" }),
  };
}
