import { COUNTRY_CODES } from "@/capabilities/country/constants/countryCodes.constants";
import { getCountryName } from "@/capabilities/country/utils/countryNames.utils";
import { describe, expect, it } from "vitest";

describe("getCountryName", () => {
  it("uses Intl.DisplayNames for ordinary localized region names", () => {
    expect(getCountryName("HR", "hr")).toBe("Hrvatska");
    expect(getCountryName("JP", "de")).toBe("Japan");
  });

  it("localizes upstream exceptional and subdivision identifiers", () => {
    expect(getCountryName("BQ-BO", "hr")).toBe("Bonaire");
    expect(getCountryName("GB-SCT", "cnr")).toBe("Škotska");
    expect(getCountryName("XA", "pt-BR")).toBe("Abecásia");
  });

  it("honors per-call overrides before built-in resolution", () => {
    expect(getCountryName("HR", "en", { overrides: { HR: "Home" } })).toBe("Home");
  });

  it("falls back to deterministic English names for invalid locales", () => {
    expect(getCountryName("GB-SCT", "not_a_locale")).toBe("Scotland");
    expect(getCountryName("HR", "not_a_locale")).toBe("Croatia");
  });

  it("retains deterministic and catalog fallbacks when Intl.DisplayNames is unavailable", () => {
    const descriptor = Object.getOwnPropertyDescriptor(Intl, "DisplayNames");
    Object.defineProperty(Intl, "DisplayNames", { configurable: true, value: undefined });

    try {
      expect(getCountryName("HR", "hr")).toBe("Croatia");
      expect(getCountryName("GB-SCT", "hr")).toBe("Škotska");
    } finally {
      if (descriptor) Object.defineProperty(Intl, "DisplayNames", descriptor);
    }
  });

  it("has a nonempty English fallback for every supported identifier", () => {
    for (const countryCode of COUNTRY_CODES) {
      expect(getCountryName(countryCode, "en")).not.toBe("");
    }
  });
});
