import { formatIntlNumber } from "@/index";
import { describe, expect, it, vi } from "vitest";

describe("formatIntlNumber", () => {
  it("formats with caller-owned locale and options", () => {
    expect(
      formatIntlNumber(1234.5, {
        locale: "en-US",
        options: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
      }),
    ).toBe("1,234.5");
  });

  it("delegates fallback policy to the caller", () => {
    const fallback = vi.fn((value: number) => `fallback:${value}`);

    expect(
      formatIntlNumber(12.5, {
        locale: "en-US",
        options: { style: "currency", currency: "not-a-currency" },
        fallback,
      }),
    ).toBe("fallback:12.5");
    expect(fallback).toHaveBeenCalledWith(12.5);
  });

  it("falls back to the string value when no fallback is supplied", () => {
    expect(
      formatIntlNumber(12.5, {
        locale: "en-US",
        options: { style: "currency", currency: "not-a-currency" },
      }),
    ).toBe("12.5");
  });
});
