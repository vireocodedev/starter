/**
 * Country reference data and lookup helpers.
 *
 * Unlike `./api` this entry point is **not** worker-safe: the country code list
 * and the `CountryCode` type are both derived from `country-flag-icons/react`,
 * so importing it evaluates React components. It exists to give the API layer a
 * narrow import that does not drag in the whole component library, not to make
 * the module usable from a Web Worker.
 *
 * Splitting the pure lookups away from the flag components would need
 * `RGO_COUNTRY_CODES` to stop being `Object.keys(CFIFlags)`, which is a redesign
 * rather than a file move - see docs/API_INVENTORY.md.
 *
 * Every symbol here is also available from the root barrel.
 */

export {
    getCountryName,
    getFlagComponent,
    RGO_COUNTRY_CODES,
    RGO_COUNTRY_CODES_CUSTOM,
    RGO_COUNTRY_CODES_CUSTOM_TRANSLATIONS_LOOKUP,
    type CountryCode,
    type CountryCodeCustom
} from "@/utils/countryutils";

