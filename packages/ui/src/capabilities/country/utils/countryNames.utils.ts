import {
  COUNTRY_ENGLISH_NAMES,
  COUNTRY_EXCEPTIONAL_NAMES,
  COUNTRY_NAME_CATALOG_LOCALES,
  type CountryNameCatalogLocale,
} from "@/capabilities/country/constants/countryNames.constants";
import type { CountryCode } from "@/capabilities/country/models/countryCode.models";
import type { CountryNameOptions } from "@/capabilities/country/types/country.types";

const DISPLAY_NAMES_CACHE = new Map<string, Intl.DisplayNames>();
const COUNTRY_NAME_CATALOG_LOCALE_SET: ReadonlySet<string> = new Set(COUNTRY_NAME_CATALOG_LOCALES);

function resolveLocale(locale: string): { canonicalLocale: string; catalogLocale?: CountryNameCatalogLocale } {
  if (locale.toLowerCase() === "cnr") {
    return { canonicalLocale: "sr-ME", catalogLocale: "cnr" };
  }

  try {
    const [canonicalLocale] = Intl.getCanonicalLocales(locale);
    if (!canonicalLocale || Intl.DisplayNames.supportedLocalesOf([canonicalLocale]).length === 0) {
      return { canonicalLocale: "en", catalogLocale: "en" };
    }

    const baseLocale = canonicalLocale.split("-")[0]?.toLowerCase();
    return {
      canonicalLocale,
      catalogLocale:
        baseLocale && COUNTRY_NAME_CATALOG_LOCALE_SET.has(baseLocale)
          ? (baseLocale as CountryNameCatalogLocale)
          : undefined,
    };
  } catch {
    return { canonicalLocale: "en", catalogLocale: "en" };
  }
}

function getDisplayNames(locale: string): Intl.DisplayNames | undefined {
  if (typeof Intl.DisplayNames !== "function") return undefined;

  const cached = DISPLAY_NAMES_CACHE.get(locale);
  if (cached) return cached;

  try {
    const displayNames = new Intl.DisplayNames([locale], { fallback: "none", type: "region" });
    DISPLAY_NAMES_CACHE.set(locale, displayNames);
    return displayNames;
  } catch {
    return undefined;
  }
}

/** Resolves a localized display name for a supported country-flag-icons identifier. */
export function getCountryName(countryCode: CountryCode, locale: string, options: CountryNameOptions = {}): string {
  const override = options.overrides?.[countryCode];
  if (override !== undefined) return override;

  const { canonicalLocale, catalogLocale } = resolveLocale(locale);
  if (catalogLocale && countryCode in COUNTRY_EXCEPTIONAL_NAMES[catalogLocale]) {
    return COUNTRY_EXCEPTIONAL_NAMES[catalogLocale][
      countryCode as keyof (typeof COUNTRY_EXCEPTIONAL_NAMES)[typeof catalogLocale]
    ];
  }

  return getDisplayNames(canonicalLocale)?.of(countryCode) ?? COUNTRY_ENGLISH_NAMES[countryCode] ?? countryCode;
}
