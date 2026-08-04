import {
  getCountryName,
  getFlagComponent,
  RGO_COUNTRY_CODES,
  RGO_COUNTRY_CODES_CUSTOM,
  type CountryCode,
} from "@/utils/countryutils";
import countries from "i18n-iso-countries";
import deCountries from "i18n-iso-countries/langs/de.json";
import enCountries from "i18n-iso-countries/langs/en.json";
import hrCountries from "i18n-iso-countries/langs/hr.json";
import { beforeAll, describe, expect, it } from "vitest";

// `getCountryName` reads from the process-wide `i18n-iso-countries` registry,
// which the app populates in RgoLocalizationProvider. Mirror that here.
beforeAll(() => {
  countries.registerLocale(deCountries);
  countries.registerLocale(enCountries);
  countries.registerLocale(hrCountries);
});

describe("country code lists", () => {
  it("excludes the module's `default` export from the ISO code list", () => {
    expect(RGO_COUNTRY_CODES).not.toContain("default");
  });

  it("appends the custom codes to the ISO codes", () => {
    expect(RGO_COUNTRY_CODES).toEqual(expect.arrayContaining([...RGO_COUNTRY_CODES_CUSTOM]));
    expect(RGO_COUNTRY_CODES).toEqual(expect.arrayContaining(["HR", "DE", "US"]));
  });

  it("does not collide custom codes with real ISO codes", () => {
    const isoCodes = RGO_COUNTRY_CODES.filter(
      code => !RGO_COUNTRY_CODES_CUSTOM.includes(code as (typeof RGO_COUNTRY_CODES_CUSTOM)[number]),
    );
    for (const custom of RGO_COUNTRY_CODES_CUSTOM) {
      expect(isoCodes).not.toContain(custom);
    }
  });
});

describe("getCountryName", () => {
  it("resolves a standard ISO code in the requested locale", () => {
    expect(getCountryName("HR", "en")).toBe("Croatia");
    expect(getCountryName("HR", "hr")).toBe("Hrvatska");
    expect(getCountryName("DE", "de")).toBe("Deutschland");
  });

  it("uppercases a lowercase code before lookup", () => {
    expect(getCountryName("hr" as CountryCode, "en")).toBe("Croatia");
  });

  it("resolves a custom code from the bundled translation table", () => {
    expect(getCountryName("KO", "en")).toBe("Kosovo");
    expect(getCountryName("WI", "de")).toBe("Westindische Föderation");
    expect(getCountryName("YD", "hr")).toBe("Jemen Arapska Republika");
  });

  it("falls back to English when the locale has no translation registered", () => {
    // `cnr` is a supported RgoLocale but i18n-iso-countries ships no such
    // catalogue, so ISO codes resolve through the English fallback.
    expect(getCountryName("HR", "cnr")).toBe("Croatia");
  });

  it("still resolves custom codes for locales with no ISO catalogue", () => {
    expect(getCountryName("KO", "cnr")).toBe("Kosovo");
  });

  it("falls back to the uppercased code when nothing resolves", () => {
    expect(getCountryName("ZZ" as CountryCode, "en")).toBe("ZZ");
  });

  it("returns an empty string for an empty code", () => {
    expect(getCountryName("" as CountryCode, "en")).toBe("");
  });
});

describe("getFlagComponent", () => {
  it("returns a component for a real ISO code", () => {
    expect(getFlagComponent("HR")).toEqual(expect.any(Function));
  });

  it("returns null for custom codes, which have no flag asset", () => {
    for (const custom of RGO_COUNTRY_CODES_CUSTOM) {
      expect(getFlagComponent(custom)).toBeNull();
    }
  });

  it("returns null for an unknown code", () => {
    expect(getFlagComponent("ZZ" as CountryCode)).toBeNull();
  });
});
