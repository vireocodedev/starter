import { COUNTRY_CODES } from "@/capabilities/country/constants/countryCodes.constants";
import { countries } from "country-flag-icons";
import { describe, expect, it } from "vitest";

describe("COUNTRY_CODES", () => {
  it("matches the upstream country-flag-icons registry exactly", () => {
    expect(COUNTRY_CODES).toEqual(countries);
    expect(COUNTRY_CODES).toHaveLength(265);
  });
});
