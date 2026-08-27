"use client";

import { PLATFORM_TRANSLATION_NAMESPACE } from "@vireocodedev/localization";
import { useTranslation } from "react-i18next";

/** Returns the app-owned i18next instance bound to Starter's platform namespace. */
export function usePlatformTranslation() {
  return useTranslation<typeof PLATFORM_TRANSLATION_NAMESPACE>(PLATFORM_TRANSLATION_NAMESPACE);
}
