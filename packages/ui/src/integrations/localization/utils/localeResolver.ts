import type { VireoTemporalLocale } from "@/integrations/localization/providers/VireoTemporalLocalizationProvider/VireoTemporalLocalizationProvider.types";
import dayjs from "dayjs";

const warnedLocales = new Set<string>();

function localeCandidates(locale: string): string[] {
  const normalized = locale.trim().replaceAll("_", "-").toLowerCase();
  if (!normalized) return [];

  const baseLocale = normalized.split("-")[0];
  return baseLocale && baseLocale !== normalized ? [normalized, baseLocale] : [normalized];
}

function isRegisteredDayjsLocale(locale: string): boolean {
  return dayjs().locale(locale).locale() === locale;
}

export function resolveVireoAdapterLocale(locale: VireoTemporalLocale, adapterLocale?: string): string {
  const requestedLocale = adapterLocale ?? locale;
  const resolvedLocale = localeCandidates(requestedLocale).find(isRegisteredDayjsLocale);

  if (resolvedLocale) return resolvedLocale;

  if (process.env.NODE_ENV !== "production" && !warnedLocales.has(requestedLocale)) {
    warnedLocales.add(requestedLocale);
    console.warn(
      `VireoTemporalLocalizationProvider could not resolve the Day.js locale "${requestedLocale}". ` +
        'Falling back to "en". Import the matching Day.js locale module before rendering the provider.',
    );
  }

  return "en";
}

export function resolveVireoPickerTextLocale(locale: VireoTemporalLocale): "en" | "hr" {
  const baseLocale = localeCandidates(locale).at(-1);
  return baseLocale === "hr" ? "hr" : "en";
}

export function resetVireoLocaleWarningsForTests(): void {
  warnedLocales.clear();
}
