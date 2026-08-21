import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_COUNTRY_FLAG_NAME,
  VIREO_COUNTRY_FLAG_SLOTS,
  type VireoCountryFlagSlotName,
} from "./VireoCountryFlag.identity";

/** Utility classes available to VireoCountryFlag. */
export type VireoCountryFlagClasses = Record<VireoCountryFlagSlotName | "known" | "unknown" | "tooltipEnabled", string>;

/** Valid keys for VireoCountryFlag utility classes and theme style overrides. */
export type VireoCountryFlagClassKey = keyof VireoCountryFlagClasses;

/** Returns the generated utility class name for a VireoCountryFlag slot or state. */
export function getVireoCountryFlagUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_COUNTRY_FLAG_NAME, slot);
}

/** Generated utility class names keyed by each public VireoCountryFlag class key. */
export const vireoCountryFlagClasses: VireoCountryFlagClasses = generateUtilityClasses(VIREO_COUNTRY_FLAG_NAME, [
  ...VIREO_COUNTRY_FLAG_SLOTS,
  "known",
  "unknown",
  "tooltipEnabled",
]);
