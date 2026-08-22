"use client";

import { QUERYENGINE_TRANSLATION_NAMESPACE } from "@vireocodedev/starter-localization";
import { useTranslation } from "react-i18next";

/** Returns the app-owned i18next instance bound to Starter's QueryEngine namespace. */
export function useQueryEngineTranslation() {
  return useTranslation<typeof QUERYENGINE_TRANSLATION_NAMESPACE>(QUERYENGINE_TRANSLATION_NAMESPACE);
}
