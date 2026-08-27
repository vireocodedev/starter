"use client";

import { HISTORY_TRANSLATION_NAMESPACE } from "@vireocodedev/localization";
import { useTranslation } from "react-i18next";

/** Returns the app-owned i18next instance bound to Starter's history namespace. */
export function useHistoryTranslation() {
  return useTranslation<typeof HISTORY_TRANSLATION_NAMESPACE>(HISTORY_TRANSLATION_NAMESPACE);
}
