import { COUNTRY_CODES } from "@/capabilities/country/constants/countryCodes.constants";
import { z } from "zod";

/** Runtime schema for identifiers backed by country-flag-icons. */
export const CountryCodeSchema = z.enum(COUNTRY_CODES);

/** Identifier backed by a 3:2 flag asset in country-flag-icons. */
export type CountryCode = z.infer<typeof CountryCodeSchema>;

const COUNTRY_CODE_SET: ReadonlySet<string> = new Set(COUNTRY_CODES);

/** Returns whether a value is a country-flag-icons registry identifier. */
export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === "string" && COUNTRY_CODE_SET.has(value);
}
