import { QUERYENGINE_TRANSLATION_NAMESPACE } from "@/localization/namespace";
import { useTranslation } from "react-i18next";

export function useQueryEngineTranslation() {
  return useTranslation<typeof QUERYENGINE_TRANSLATION_NAMESPACE>(QUERYENGINE_TRANSLATION_NAMESPACE);
}
