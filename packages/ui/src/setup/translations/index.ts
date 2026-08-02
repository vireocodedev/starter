import { RGO_LOCALE_NAMESPACE } from "@/setup/config/RgoLocale";
import bs from "@/setup/translations/translation.bs";
import cnr from "@/setup/translations/translation.cnr";
import de from "@/setup/translations/translation.de";
import en from "@/setup/translations/translation.en";
import hr from "@/setup/translations/translation.hr";
import it from "@/setup/translations/translation.it";
import pt from "@/setup/translations/translation.pt";
import sl from "@/setup/translations/translation.sl";

export default {
  en: { [RGO_LOCALE_NAMESPACE]: en },
  bs: { [RGO_LOCALE_NAMESPACE]: bs },
  cnr: { [RGO_LOCALE_NAMESPACE]: cnr },
  de: { [RGO_LOCALE_NAMESPACE]: de },
  hr: { [RGO_LOCALE_NAMESPACE]: hr },
  it: { [RGO_LOCALE_NAMESPACE]: it },
  pt: { [RGO_LOCALE_NAMESPACE]: pt },
  sl: { [RGO_LOCALE_NAMESPACE]: sl },
} as const;
