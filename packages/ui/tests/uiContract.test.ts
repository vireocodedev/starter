import { DelayedRender, RgoIconContainer, VireoDelayedRender, VireoIconContainer } from "@/index";
import { createCurrencyFormatter, formatCompactCurrency } from "@/utils/currencyFormatters";
import { createMonthFormatter, createMonthYearFormatter } from "@/utils/dateFormatters";
import { describe, expect, it } from "vitest";

/** Guards package-root compatibility aliases and dependency-light utility behavior. */
describe("starter-ui package contract", () => {
  it("preserves the deprecated DelayedRender package alias", () => {
    expect(DelayedRender).toBe(VireoDelayedRender);
  });

  it("preserves the deprecated RgoIconContainer package alias", () => {
    expect(RgoIconContainer).toBe(VireoIconContainer);
  });

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
