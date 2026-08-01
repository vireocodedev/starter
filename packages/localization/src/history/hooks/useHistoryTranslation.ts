import { HISTORY_TRANSLATION_NAMESPACE } from "@/history/namespace";
import { useTranslation } from "react-i18next";

export function useHistoryTranslation() {
  return useTranslation<typeof HISTORY_TRANSLATION_NAMESPACE>(HISTORY_TRANSLATION_NAMESPACE);
}
