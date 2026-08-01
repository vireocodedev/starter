import { PLATFORM_TRANSLATION_NAMESPACE } from "@/platform/namespace";
import { useTranslation } from "react-i18next";

export function usePlatformTranslation() {
  return useTranslation<typeof PLATFORM_TRANSLATION_NAMESPACE>(PLATFORM_TRANSLATION_NAMESPACE);
}
