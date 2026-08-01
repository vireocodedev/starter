import { createCurrencyFormatter, formatCompactCurrency } from "@/utils/currencyFormatters";
import { createMonthFormatter, createMonthYearFormatter } from "@/utils/dateFormatters";
import { describe, expect, it } from "vitest";

/**
 * Contract guard for the headless `@vireocodedev/starter-ui` utilities. The MUI
 * components are validated by consuming apps; these pure formatters are the
 * dependency-light surface worth pinning here.
 */
describe("starter-ui utils contract", () => {
  it("builds a currency formatter for a locale", () => {
    const formatter = createCurrencyFormatter("en-US", "EUR");
    expect(formatter.format(1234.5)).toContain("€");
  });

  it("formats compact currency", () => {
    expect(typeof formatCompactCurrency(1500, "EUR")).toBe("string");
  });

  it("builds month and month-year date formatters", () => {
    const date = new Date(Date.UTC(2024, 0, 15));
    expect(typeof createMonthFormatter("en-US").format(date)).toBe("string");
    expect(typeof createMonthYearFormatter("en-US").format(date)).toBe("string");
  });
});
