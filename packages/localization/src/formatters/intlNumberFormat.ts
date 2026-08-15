export type IntlNumberFormatRequest = {
  locale: string;
  options?: Intl.NumberFormatOptions;
  fallback?: (value: number) => string;
};

/** Locale-neutral formatting primitive; application locale/default policy stays at the call site. */
export function formatIntlNumber(value: number, request: IntlNumberFormatRequest): string {
  try {
    return new Intl.NumberFormat(request.locale, request.options).format(value);
  } catch {
    return request.fallback?.(value) ?? String(value);
  }
}
