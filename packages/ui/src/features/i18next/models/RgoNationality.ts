import { RGO_COUNTRY_CODES, type CountryCode } from "@/utils/countryutils";
import z from "zod";

export const RgoNationality = z.enum(RGO_COUNTRY_CODES as [CountryCode, ...CountryCode[]]);

export type RgoNationality = CountryCode;
