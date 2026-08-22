import { COUNTRY_CODES } from "@/capabilities/country/constants/countryCodes.constants";
import { CountryCodeSchema, isCountryCode } from "@/capabilities/country/models/countryCode.models";
import { describe, expect, it } from "vitest";

describe("CountryCode", () => {
  it("accepts every registry identifier", () => {
    for (const countryCode of COUNTRY_CODES) {
      expect(CountryCodeSchema.parse(countryCode)).toBe(countryCode);
      expect(isCountryCode(countryCode)).toBe(true);
    }
  });

  it("rejects values outside the registry", () => {
    expect(CountryCodeSchema.safeParse("ZZ").success).toBe(false);
    expect(isCountryCode("ZZ")).toBe(false);
    expect(isCountryCode(null)).toBe(false);
  });
});
