import { registerStarterResources } from "@vireocodedev/starter-localization";
import i18next from "i18next";

export async function runRegistrationExample() {
  const instance = i18next.createInstance();
  await instance.init({ lng: "hr", resources: {} });

  registerStarterResources(instance, { locales: ["en", "hr"] });

  return {
    save: instance.t("common.save", { ns: "platform" }),
    historyTitle: instance.t("title", { ns: "history" }),
    queryAction: instance.t("addFilter", { ns: "queryengine" }),
  };
}
