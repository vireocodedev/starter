import { createStarterResources, STARTER_TRANSLATION_NAMESPACES } from "@vireocodedev/starter-localization";

export function runPrimaryWorkflowExample() {
  const resources = createStarterResources({
    locales: ["en", "hr", "de"] as const,
    overrides: {
      de: {
        platform: { common: { save: "Speichern" } },
        history: { title: "Verlauf" },
      },
    },
  });

  return {
    namespaces: STARTER_TRANSLATION_NAMESPACES,
    german: {
      save: resources.de.platform.common.save,
      cancelSeededFromEnglish: resources.de.platform.common.cancel,
      historyTitle: resources.de.history.title,
    },
    croatian: {
      save: resources.hr.platform.common.save,
      historyTitle: resources.hr.history.title,
    },
  };
}
