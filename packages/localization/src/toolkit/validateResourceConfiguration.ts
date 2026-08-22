type OverridesByLocale = Readonly<Record<string, unknown>> | undefined;

export function validateResourceConfiguration(
  caller: string,
  locales: readonly string[],
  overrides?: OverridesByLocale,
): void {
  if (locales.length === 0) {
    throw new Error(`${caller} requires at least one locale identifier.`);
  }

  const invalidLocale = locales.find(locale => locale.trim().length === 0 || locale !== locale.trim());
  if (invalidLocale !== undefined) {
    throw new Error(`${caller} requires non-empty, trimmed locale identifiers.`);
  }

  if (new Set(locales).size !== locales.length) {
    throw new Error(`${caller} requires unique locale identifiers.`);
  }

  if (!overrides) {
    return;
  }

  const requestedLocales = new Set(locales);
  const unexpectedLocale = Object.keys(overrides).find(locale => !requestedLocales.has(locale));
  if (unexpectedLocale !== undefined) {
    throw new Error(`${caller} received an override for unrequested locale "${unexpectedLocale}".`);
  }
}
