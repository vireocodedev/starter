import type { CountryCode } from "@/capabilities/country/models/countryCode.models";

/** Options for resolving a localized country or territory display name. */
export type CountryNameOptions = {
  /** Already-localized names that take precedence over Vireo and platform data. */
  overrides?: Partial<Record<CountryCode, string>>;
};
