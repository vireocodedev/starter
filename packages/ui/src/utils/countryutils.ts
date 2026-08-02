import { type RgoLocale } from "@/setup/config/RgoLocale";
import * as CFIFlags from "country-flag-icons/react/3x2";
import countries from "i18n-iso-countries";

export const RGO_COUNTRY_CODES_CUSTOM = [
  "WI",
  "AJ",
  "AN",
  "ON",
  "OB",
  "KB",
  "OF",
  "OU",
  "FL",
  "KO",
  "YD",
] as const satisfies readonly string[];

export type CountryCodeCustom = (typeof RGO_COUNTRY_CODES_CUSTOM)[number];

export type CountryCode = keyof typeof CFIFlags | CountryCodeCustom;

export const RGO_COUNTRY_CODES = Object.keys(CFIFlags)
  .filter(c => c !== "default")
  .concat(RGO_COUNTRY_CODES_CUSTOM) as CountryCode[];

export const RGO_COUNTRY_CODES_CUSTOM_TRANSLATIONS_LOOKUP: Record<CountryCodeCustom, Record<RgoLocale, string>> = {
  WI: {
    en: "West Indies Federation",
    de: "Westindische Föderation",
    bs: "Zapadnoindijska Federacija",
    cnr: "Zapadnoindijska Federacija",
    hr: "Zapadnoindijska Federacija",
    it: "Federazione delle Indie Occidentali",
    pt: "Federação das Índias Ocidentais",
    sl: "Zahodnoindijska federacija",
  },
  AJ: {
    en: "American Virgin Islands",
    de: "Amerikanische Jungferninseln",
    bs: "Američka Djevičanska Ostrva",
    cnr: "Američka Djevičanska Ostrva",
    hr: "Američka Djevičanska Ostrva",
    it: "Isole Vergini Americane",
    pt: "Ilhas Virgens Americanas",
    sl: "Ameriški Deviški otoki",
  },
  AN: {
    en: "Netherlands Antilles",
    de: "Niederländische Antillen",
    bs: "Nizozemski Antili",
    cnr: "Nizozemski Antili",
    hr: "Nizozemski Antili",
    it: "Antille Olandesi",
    pt: "Antilhas Holandesas",
    sl: "Nizozemske Antile",
  },
  ON: {
    en: "New Zealand Oceanian Region",
    de: "Neuseeland Ozeanien Region",
    bs: "Novozelandska Okeanijska Regija",
    cnr: "Novozelandska Okeanijska Regija",
    hr: "Novozelandska Okeanijska Regija",
    it: "Regione Oceaniana della Nuova Zelanda",
    pt: "Região Oceânica da Nova Zelândia",
    sl: "Novozelandska oceanijska regija",
  },
  OB: {
    en: "British Oceania",
    de: "Britisches Ozeanien",
    bs: "Britanska Okeanija",
    cnr: "Britanska Okeanija",
    hr: "Britanska Okeanija",
    it: "Oceania Britannica",
    pt: "Oceania Britânica",
    sl: "Britanska Oceanija",
  },
  KB: {
    en: "Kiribati",
    de: "Kiribati",
    bs: "Kiribati",
    cnr: "Kiribati",
    hr: "Kiribati",
    it: "Kiribati",
    pt: "Kiribati",
    sl: "Kiribati",
  },
  OF: {
    en: "French Oceania",
    de: "Französisches Ozeanien",
    bs: "Francuska Okeanija",
    cnr: "Francuska Okeanija",
    hr: "Francuska Okeanija",
    it: "Oceania Francese",
    pt: "Oceania Francesa",
    sl: "Francoska Oceanija",
  },
  OU: {
    en: "US Oceania",
    de: "US Ozeanien",
    bs: "Američka Okeanija",
    cnr: "Američka Okeanija",
    hr: "Američka Okeanija",
    it: "Oceania Americana",
    pt: "Oceania Americana",
    sl: "Ameriška Oceanija",
  },
  FL: {
    en: "Liechtenstein",
    de: "Liechtenstein",
    bs: "Lihtenštajn",
    cnr: "Lihtenštajn",
    hr: "Lihtenštajn",
    it: "Liechtenstein",
    pt: "Liechtenstein",
    sl: "Lihtenštajn",
  },
  KO: {
    en: "Kosovo",
    de: "Kosovo",
    bs: "Kosovo",
    cnr: "Kosovo",
    hr: "Kosovo",
    it: "Kosovo",
    pt: "Kosovo",
    sl: "Kosovo",
  },
  YD: {
    en: "Yemen Arab Republic",
    de: "Jemen Arabische Republik",
    bs: "Jemen Arapska Republika",
    cnr: "Jemen Arapska Republika",
    hr: "Jemen Arapska Republika",
    it: "Yemen Repubblica Araba",
    pt: "Iémen República Árabe",
    sl: "Jemen Arabska republika",
  },
};

export function getFlagComponent(countryCode: CountryCode) {
  return CFIFlags[countryCode as keyof typeof CFIFlags] || null;
}

export function getCountryName(countryCode: CountryCode, locale: RgoLocale): string {
  if (!countryCode) return "";

  const currentLocale = locale;
  const upperCaseCode = countryCode.toUpperCase();

  let name: string | undefined;

  if (RGO_COUNTRY_CODES_CUSTOM.includes(countryCode as CountryCodeCustom)) {
    name = RGO_COUNTRY_CODES_CUSTOM_TRANSLATIONS_LOOKUP[countryCode as CountryCodeCustom][currentLocale];
  } else {
    name = countries.getName(upperCaseCode, currentLocale);
    if (!name && currentLocale !== "en") {
      name = countries.getName(upperCaseCode, "en");
    }
  }

  return name || upperCaseCode;
}
