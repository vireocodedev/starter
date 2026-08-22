import { formatIntlNumber } from "@vireocodedev/starter-localization";

export function runFormattingExample() {
  const amount = 1234.5;

  return {
    croatianCurrency: formatIntlNumber(amount, {
      locale: "hr-HR",
      options: { style: "currency", currency: "EUR" },
    }),
    americanDecimal: formatIntlNumber(amount, {
      locale: "en-US",
      options: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    }),
    deliberateFallback: formatIntlNumber(amount, {
      locale: "en-US",
      options: { style: "currency", currency: "invalid" },
      fallback: value => `Unformatted: ${value}`,
    }),
  };
}
